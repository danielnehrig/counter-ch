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

/**
 * Main Control Flow
 * 1. Entry Point Get Called aka main
 * 2. Main calls registerHandlers to attach events to the buttons
 * 3. Main calls render to display the table and the counter
 * 4. Render calls displayTable to display the table
 * 5. Render calls displayCounter to display the counter
 * 6. Render calls delay to delay the execution of the next line to slow down the loop for performance reasons
 * 7. Render calls displayCounter to update the counter if the buffer has one timestamp
 *
 * Event Flow
 *
 * Counter Click
 * 1. User clicks on the counter button
 * 2. The countdownHandler gets called
 * 3. The countdownHandler pushes the current timestamp to the buffer
 * 4. The countdownHandler checks if the buffer has two timestamps
 * 5. If the buffer has two timestamps the countdownHandler pushes the buffer to the persistance array
 * 6. The countdownHandler updates the counter button text
 * 7. The countdownHandler calls displayTable to update the table
 * 8. The countdownHandler calls displayCounter to update the counter
 * 9. The countdownHandler calls localStorage.setItem to persist the data
 *
 * Reset Click
 * 1. User clicks on the reset button
 * 2. The resetHandler gets called
 * 3. The resetHandler resets the persistance array
 * 4. The resetHandler resets the buffer array
 * 5. The resetHandler calls localStorage.setItem to persist the data
 * 6. The resetHandler calls displayTable to update the table
 * 7. The resetHandler calls displayCounter to update the counter
 *
 * Download Click
 * 1. User clicks on the download button
 * 2. The downloadHandler gets called
 * 3. The downloadHandler calls JSON.stringify to convert the persistance array to a string
 * 4. The downloadHandler calls new Blob to create a blob from the string
 * 5. The downloadHandler calls URL.createObjectURL to create a url from the blob
 * 6. The downloadHandler sets the href attribute of the download button to the url
 *
 * Upload Click
 * 1. User clicks on the upload button
 * 2. The uploadHandler gets called
 * 3. The uploadHandler calls e.target.files to get the file
 * 4. The uploadHandler calls new FileReader to read the file
 * 5. The uploadHandler calls readAsText to read the file as text
 * 6. The uploadHandler calls reader.onload to get the content of the file
 * 7. The uploadHandler calls JSON.parse to convert the content to an array
 * 8. The uploadHandler sets the persistance array to the parsed array
 * 9. The uploadHandler calls localStorage.setItem to persist the data
 * 10. The uploadHandler calls displayTable to update the table
 * 11. The uploadHandler calls displayCounter to update the counter
 */
