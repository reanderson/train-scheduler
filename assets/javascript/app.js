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

// declare constants for all the html piece
const trainNameInput = $("#trainName");
const trainDestInput = $("#trainDest");
const trainFirstInput = $("#trainFirst");
const trainFreqInput = $("#trainFreq");
const trainSubmitBtn = $("#trainSubmit");
const trainTableRef = $("#trainTable");

// on click event for submit button
trainSubmitBtn.on("click", function(event) {
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


})