const displayTime = document.getElementById("displayTime");
const counterButton = document.getElementById("counter");
const resetButton = document.getElementById("reset");
const displayTimeTable = document.getElementById("displayTimeTable");

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

  if (buffer.length === 1) {
    counterButton.innerHTML = "Stop";
  } else {
    counterButton.innerHTML = "Start";
  }

  if (buffer.length > 1) {
    persistance.push(buffer);
    localStorage.setItem("persistance", JSON.stringify(persistance));
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
    displayTimeTable.innerHTML = "";
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
  while (true) {
    displayCounter();
    displayTable();
    await delay(50);
  }
};

const main = () => {
  if (counterButton) {
    counterButton.addEventListener("click", countdownHandler);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetHandler);
  }
  render();
};

main();
