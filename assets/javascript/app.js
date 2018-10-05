// initialize firebase
const config = {
  apiKey: "AIzaSyC3ySTU4HClXSP4lji7VbZtr3aAPMMzH3U",
  authDomain: "train-scheduler-87be5.firebaseapp.com",
  databaseURL: "https://train-scheduler-87be5.firebaseio.com",
  projectId: "train-scheduler-87be5",
  storageBucket: "train-scheduler-87be5.appspot.com",
  messagingSenderId: "158112540609"
};
firebase.initializeApp(config);

const database = firebase.database();

// declare constants for html pieces
const trainNameInput = $("#trainName");
const trainDestInput = $("#trainDest");
const trainFirstInput = $("#trainFirst");
const trainFreqInput = $("#trainFreq");
const trainSubmitBtn = $("#trainSubmit");

let activeKey = false;

//===========================================================================================
// on click event for submit button
trainSubmitBtn.on("click", function (event) {
  event.preventDefault();

  // grab user input
  const trainName = trainNameInput.val().trim();
  const trainDest = trainDestInput.val().trim();
  const trainFirst = trainFirstInput.val().trim();
  const trainFreq = trainFreqInput.val().trim();


  // input validation
  if (!trainName || !trainDest || !trainFirst || !trainFreq) {
    console.log("invalid input")
    $("#validation").text("Please fill all fields.")
    return false;
  }
  $("#validation").empty()

  console.log(trainName)
  console.log(trainDest)
  console.log(trainFirst)
  console.log(trainFreq)

  // create object for the new train
  const newTrain = {
    name: trainName,
    destination: trainDest,
    start: trainFirst,
    frequency: trainFreq
  }

  //push new train to the database
  database.ref().push(newTrain);

  // reset input fields
  trainNameInput.val("");
  trainDestInput.val("");
  trainFirstInput.val("");
  trainFreqInput.val("");
})

function createRowContents(targetRow, snapshotValue, key) {
  //takes a jquery html object <tr>,
  //a snapshot.val() from firebase
  //and a snapshot(key) from firebase
  //appends appropriate row data to the targetRow

  // the name, destination, and frequency come straight out of the object
  const name = snapshotValue.name;
  const destination = snapshotValue.destination;
  const frequency = snapshotValue.frequency;

  // to determine the next train time and the time until the next train, we need the starting time in Unix, the frequency in seconds, and the current time in unix
  let next;
  let timeuntil;

  const now = moment().format("X")
  const start = moment(snapshotValue.start, "HH:mm").format("X");
  const freqSec = parseInt(frequency) * 60;
  console.log(`now: ${now}`);
  console.log(start);
  console.log(freqSec)

  // If it is currently before the starting time,
  if (now < start) {
    // use only the start time to determine the next train and time until then
    next = moment(start, "X").format("hh:mm A")
    timeuntil = moment(start, "X").toNow(true)
  } else {
    // if we're after the starting time, then
    // add the frequency (in seconds) to the starting time
    // make sure to parseInt on that start and now,
    // or else you're going to end up with a permanent loop that crashes the page,
    // and no one wants one of those.
    next = parseInt(start) + freqSec
    while (next < parseInt(now)) {
      // until the next train is starting later than the current time,
      // keep adding the frequenc (in seconds) to the next train
      next = next + freqSec
      console.log(`next: ${next}`)
    }
    // once the while loop has finished,
    timeuntil = moment(next, "X").toNow(true)
    next = moment(next, "X").format("hh:mm A")
  }

  targetRow.append(
      $("<td>").text(name),
      $("<td>").text(destination),
      $("<td>").text(frequency),
      $("<td>").text(next),
      $("<td>").text(timeuntil),
      $("<td>").html(`<i class="fas fa-pencil-alt editTrain" data-key=${key}></i>`),
      $("<td>").html(`<i class="fas fa-trash deleteTrain" data-key=${key}></i>`),
    )
}

//create firebase event for when a child is added
database.ref().on("child_added", function (childSnapshot) {
  console.log(childSnapshot.key)
  console.log(childSnapshot.val());

  // This is the key for the child's data in Firebase
  const childKey = childSnapshot.key

  // This is all the data we care about
  const train = childSnapshot.val()

  const newRow = $("<tr>")

  createRowContents(newRow, train, childKey)

  newRow.attr("data-key", childKey);

  // Append the new row to the table
  $("#trainTable > tbody").append(newRow);
})

//firebase event for child deleted
database.ref().on("child_removed", function (childSnapshot) {
  const key = childSnapshot.key

  // Select the element in the table that has the data-key attribute with a value equal to the key of the removed item, and remove it from the page
  $(`[data-key=${key}]:first`).remove()
})

//firebase event for child updated
database.ref().on("child_changed", function (childSnapshot) {
  const key = childSnapshot.key

  // select the row in the table that has the data-key attribute equal to the key
  // we're using :first with this just to make sure it doesn't also grab the edit and delete buttons and accidentally cause unwanted issues.
  const targetRow = $(`[data-key=${key}]:first`)

  //empty out the row
  targetRow.empty()

  createRowContents(targetRow, childSnapshot.val(), key)
})
//=======================================================================================
$(document).on("click", ".deleteTrain", function () {
  activeKey = $(this).attr("data-key")
  $("#deleteTrainModal").modal('show')
})

$("#doNotDeleteItem").on("click", function () {
  $("#deleteTrainModal").modal('hide')

  activeKey = false;
})

$("#deleteTrain").on("click", function () {
  database.ref(activeKey).remove()

  $("#deleteTrainModal").modal('hide')

  activeKey = false;
})

$(document).on("click", ".editTrain", function () {
  activeKey = $(this).attr("data-key")

  database.ref(activeKey).once('value').then(function (snapshot) {
    const data = snapshot.val()
    // set edit data modal's values to the current values of the data already in the database
    $("#editTrainName").val(data.name);
    $("#editTrainDest").val(data.destination);
    $("#editTrainFirst").val(data.start);
    $("#editTrainFreq").val(data.frequency);
    $("#editTrainModal").modal('show')
  })

})

$("#editTrainSubmit").on("click", function (event) {
  event.preventDefault();

  // grab user input
  const trainName = $("#editTrainName").val().trim();
  const trainDest = $("#editTrainDest").val().trim();
  const trainFirst = $("#editTrainFirst").val().trim();
  const trainFreq = $("#editTrainFreq").val().trim();


  // input validation
  if (!trainName || !trainDest || !trainFirst || !trainFreq) {
    console.log("invalid input")
    $("#editvalidation").text("Please fill all fields.")
    return false;
  }
  $("#editvalidation").empty()

  //update train in the database
  database.ref(activeKey).update({
    name: trainName,
    destination: trainDest,
    start: trainFirst,
    frequency: trainFreq
  })

  $("#editTrainModal").modal('hide')
})