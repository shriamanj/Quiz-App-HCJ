let interval = null;
let currentUser = null;
let currentQuestion = null;

function loadNavbar(selector = "#navbar") {
  fetch("../components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.querySelector(selector).innerHTML = data;
    })
    .catch((err) => console.error("Error loading navbar:", err));
}

function getQuesNumberClassName(i) {
  let className = "flex justify-center p-2 rounded-full shadow w-10 h-10 ";
  if (currentUser?.questions[i]?.yourAnswer !== "") {
    className = className + "bg-green-300";
  } else if (
    currentUser?.questions[i]?.yourAnswer === "" &&
    currentUser?.questions[i]?.timeTaken < 60
  ) {
    className = className + "bg-purple-300";
  } else {
    className = className + "bg-gray-200";
  }
  return className;
}

function getPregressWidth() {
  const filterAns = currentUser?.questions.filter(
    (item) =>
      item.yourAnswer !== "" || (item.yourAnswer === "" && item.timeTaken < 60)
  );
  return (filterAns.length * 100) / currentUser?.questions.length;
}

function loadQuestions() {
  if (currentUser?.questions) {
    const container = document.getElementById("container");
    for (let i = 0; i <= currentUser?.questions.length - 1; i++) {
      const div = document.createElement("div");
      div.id = `question-number-${i + 1}`;
      div.textContent = `${i + 1}`;
      div.onclick = () => saveNext(i);
      div.className = getQuesNumberClassName(i);
      container.appendChild(div);
    }
  }
}

const getGrade = (accuracy) => {
  if (accuracy >= 90 && accuracy <= 100) return "A+";
  if (accuracy >= 80 && accuracy <= 90) return "A";
  if (accuracy >= 70 && accuracy <= 80) return "B+";
  if (accuracy >= 60 && accuracy <= 70) return "B";
  if (accuracy >= 50 && accuracy <= 60) return "C+";
  if (accuracy >= 40 && accuracy <= 50) return "C";
  else return "D";
};

function loadQuizReview() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  document.getElementById(
    "totalQuestions"
  ).textContent = ` ${currentUser.questions.length} Questions`;
  const accuracy = (currentUser.score * 100) / currentUser.questions.length;
  document.getElementById("accuracy").textContent = `${accuracy}%`;
  document.getElementById("award").textContent = getGrade(accuracy);
  document.getElementById(
    "answered"
  ).textContent = `${currentUser.score}/${currentUser.questions.length}`;
  document.getElementById("correct").textContent = currentUser.score;
  document.getElementById("incorrect").textContent = currentUser.incorrect;
  document.getElementById("skipped").textContent = currentUser.skipped;
  document.getElementById("not-attempted").textContent =
    currentUser.notAttempted;
  document.getElementById("time-taken").textContent =
    currentUser.totalTimeTaken;

  const question = document.getElementById("totalQues");
  currentUser.questions.forEach((ques) => {
    const tr = document.createElement("tr");
    tr.className = "p-2 even:bg-blue-100";
    const td1 = document.createElement("td");
    td1.className = "w-[40%] p-2";
    td1.textContent = `Q${ques.id + 1}. ${ques.question}`;
    const td2 = document.createElement("td");
    td2.className = "w-[15%]";
    td2.textContent = ques.yourAnswer;
    const td3 = document.createElement("td");
    td3.className = "w-[15%]";
    td3.textContent = ques.correct_answer;
    const td4 = document.createElement("td");
    td4.className = "w-[15%]";
    td4.innerHTML =
      ques.correct_answer === ques.yourAnswer
        ? `<i class="fa-solid fa-check"></i>`
        : `<i class="fa-solid fa-xmark"></i>`;
    const td5 = document.createElement("td");
    td5.className = "w-[15%]";
    td5.textContent = ques.timeTaken;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    question.appendChild(tr);
  });
}

function startTimer() {
  const timerEl = document.getElementById("timer");
  let timerValue = 60;
  timerEl.textContent = timerValue;
  interval = setInterval(() => {
    timerValue--;
    timerEl.textContent = timerValue;
    if (timerValue <= 0) {
      clearInterval(interval);
      saveNext();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function setNavbar() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  document.getElementById("nav-items").style.display = "none";
  const userDetails = document.getElementById("user-details");
  userDetails.style.display = "block";
  userDetails.textContent = `${currentUser?.name} (${currentUser?.email})`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function remaningTimer() {
  const timerEl = document.getElementById("remaningTime");
  let timeLeft = currentUser.questions.length * 60;
  const intervalRem = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(intervalRem);
      timerEl.textContent = "00:00";
      return;
    }
    timerEl.textContent = formatTime(timeLeft);
    timeLeft--;
  }, 1000);
}

function getOption(id, questionText, options) {
  const question = document.getElementById("question");
  question.textContent = `Q${id + 1}. ${questionText}`;
  const ul = document.getElementById("options");
  ul.innerHTML = "";
  options.forEach((optionText, index) => {
    const li = document.createElement("li");
    li.className = "flex gap-2 items-center";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "question"; // all radios share same name to form a group
    input.id = `option-${index}`;
    input.value = optionText;

    const label = document.createElement("label");
    label.htmlFor = `option-${index}`;
    label.textContent = optionText;

    li.appendChild(input);
    li.appendChild(label);
    ul.appendChild(li);
  });
  startTimer();
}

async function fetchQuestion() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  currentUser = users[0];
  const res = await fetch(
    "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple"
  );
  const data = await res.json();
  const ques = data.results.map((item, index) => {
    return { ...item, id: index, yourAnswer: "", timeTaken: 60 };
  });
  currentUser.questions = ques;
  currentQuestion = ques[0];
  document.getElementById("user-detail").style.display = "none";
  document.getElementById("quiz-questions").style.display = "flex";
  document.getElementById("nav-items").style.display = "none";
  document.getElementById("remaningTime").style.display = "flex";
  const options = [...ques[0].incorrect_answers, ques[0].correct_answer].sort(
    () => Math.random() - 0.5
  );
  loadQuestions();
  remaningTimer();
  getOption(ques[0].id, ques[0].question, options);
}

async function startQuiz() {
  stopTimer();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  if (name && email) {
    const rollNumber = Math.floor(100000 + Math.random() * 900000);
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex((user) => email === user.email);
    currentUser = {
      name: name,
      email: email,
      rollNumber: rollNumber,
      score: "",
      totalTimeTaken: "",
      questions: [],
    };
    if (index !== -1) users[index] = { ...currentUser };
    else users.push(currentUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    fetchQuestion();
  } else {
    document.getElementById("enter-name").style.display =
      name == "" ? "block" : "none";
    document.getElementById("enter-email").style.display =
      email == "" ? "block" : "none";
  }
}

const saveNext = (index) => {
  const selected = document.querySelector('input[name="question"]:checked');
  const timerEl = document.getElementById("timer");
  currentUser.questions[currentQuestion.id].timeTaken =
    60 - parseInt(timerEl.textContent);
  currentUser.questions[currentQuestion.id].yourAnswer = selected?.value || "";
  const nextQues = index
    ? currentUser.questions[index]
    : currentUser.questions[currentQuestion.id + 1];
  const options = [...nextQues.incorrect_answers, nextQues.correct_answer].sort(
    () => Math.random() - 0.5
  );
  const queNum = document.getElementById(
    `question-number-${currentQuestion.id + 1}`
  );
  queNum.className = getQuesNumberClassName(currentQuestion.id);
  const progressWidth = getPregressWidth();
  const progress = document.getElementById("progress");
  progress.className = progress.className.replace(/w-\[\d+%\]/, "");
  progress.classList.add(`w-[${progressWidth}%]`);
  stopTimer();
  currentQuestion = nextQues;
  getOption(nextQues.id, nextQues.question, options);
};

function submitQuiz() {
  let score = 0,
    incorrect = 0,
    skipped = 0,
    notAttempted = 0,
    totalTime = 0;
  currentUser.questions.forEach((item) => {
    if (item.yourAnswer === item.correct_answer) {
      score++;
      totalTime = totalTime + item.timeTaken;
    } else if (item.timeTaken < 60 && item.yourAnswer === "") {
      skipped++;
      totalTime = totalTime + item.timeTaken;
    } else if (
      item.yourAnswer !== "" &&
      item.yourAnswer !== item.correct_answer
    ) {
      incorrect++;
      totalTime = totalTime + item.timeTaken;
    } else if (item.timeTaken === 60 && item.yourAnswer === "") {
      notAttempted++;
    }
  });
  currentUser.incorrect = incorrect;
  currentUser.skipped = skipped;
  currentUser.notAttempted = notAttempted;
  currentUser.score = score;
  currentUser.totalTimeTaken = totalTime;

  const users = JSON.parse(localStorage.getItem("users"));
  const index = users.findIndex(
    (item) => item.rollNumber === currentUser.rollNumber
  );
  users[index] = { ...currentUser };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  window.location.href = "review.html";
}

function findResult() {
  const users = JSON.parse(localStorage.getItem("users"));
  const emailId = document.getElementById("email-id").value;
  const currentUser = users.find((user) => emailId === user.email);
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  window.location.href = "review.html";
}
