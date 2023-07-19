// Bunch of dom selects
const displayTime = document.getElementById("displayTime"); // displays the spend time the counter was running
const counterButton = document.getElementById("counter"); // counter button element
const resetButton = document.getElementById("reset"); // reset button element
const displayTimeTable = document.getElementById("displayTimeTable"); // displays the table of timestamps
const downloadButton = document.getElementById("download");
const uploadButton = document.getElementById("upload");

/**
 * Delay the execution of the next line
 * @param {number} time
 * @returns {Promise<number>}
 */
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * Persistance data
 * @type {number[][]}
 */
let persistance = JSON.parse(localStorage.getItem("persistance")) || [];

/**
 * Buffer the timestamps
 * @type {number[]}
 */
let buffer = [];

/**
 * Handler for the counter button
 */
const countdownHandler = () => {
  buffer.push(Date.now());

  if (buffer.length === 1) counterButton.innerHTML = "Stop";
  if (buffer.length === 2) counterButton.innerHTML = "Start";

  if (buffer.length > 1) {
    persistance.push(buffer);
    localStorage.setItem("persistance", JSON.stringify(persistance));
    displayTable();
    buffer = [];
  }
};

/**
 * Handler for the reset button
 */
const resetHandler = () => {
  persistance = [];
  buffer = [];
  localStorage.setItem("persistance", JSON.stringify(persistance));
  displayTable();
};

/**
 * Download Current Data
 */
const downloadHandler = () => {
  const data = JSON.stringify(persistance);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  if (!downloadButton) return;
  downloadButton.href = url;
};

/**
 * Upload your file
 * @param {Event} e
 */
const uploadHandler = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = (readerEvent) => {
    const content = readerEvent.target.result;
    persistance = JSON.parse(content);
    localStorage.setItem("persistance", JSON.stringify(persistance));
    displayTable();
    displayCounter(); // init display counter
  };
};

/**
 * calculate the time between two timestamps
 * @param {number[]} data
 */
const get_time = (data) => {
  const [start, end] = data;
  return end - start;
};

/**
 * calculate the average time between two timestamps
 * @param {number[][]} data
 */
const accumulate = (data) => {
  const sum = data.reduce((acc, curr) => acc + get_time(curr), 0);
  return sum;
};

/**
 * calculate the time spend
 * from past and current timestamps in the buffer
 */
const calculateCurrentPastTime = () => {
  if (buffer.length === 0) {
    return accumulate(persistance);
  }

  const now = new Date();
  return accumulate([...persistance, [buffer[0], now.getTime()]]);
};

/**
 * Updates the view with the time spend
 */
const displayCounter = () => {
  const data = calculateCurrentPastTime();
  if (displayTime) {
    displayTime.innerHTML = `Total Time Spend: ${data}ms`;
  }
};

/**
 * Updates the view with the time table
 */
const displayTable = () => {
  if (displayTimeTable) {
    displayTimeTable.innerHTML = ""; // reset the time table on every call
    persistance.forEach((data) => {
      const row = document.createElement("tr");
      const start = document.createElement("td");
      const end = document.createElement("td");
      const time = document.createElement("td");

      start.innerHTML = new Date(data[0]).toLocaleTimeString();
      end.innerHTML = new Date(data[1]).toLocaleTimeString();
      time.innerHTML = get_time(data);

      row.appendChild(start);
      row.appendChild(end);
      row.appendChild(time);

      displayTimeTable.appendChild(row);
    });
  }
};

/**
 * Renders the time spend
 */
const render = async () => {
  displayTable(); // init display table
  displayCounter(); // init display counter
  // update the view
  while (true) {
    if (buffer.length === 1) {
      displayCounter();
      await delay(50);
    } else {
      await delay(500);
    }
  }
};

/**
 * Register the handlers
 */
const registerHandlers = () => {
  if (counterButton) {
    counterButton.addEventListener("click", countdownHandler);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetHandler);
  }

  if (downloadButton) {
    download.addEventListener("click", downloadHandler);
  }

  if (uploadButton) {
    uploadButton.addEventListener("change", uploadHandler);
  }
};

// entry point
const main = () => {
  registerHandlers();
  render();
};

// execute the main function
main();
