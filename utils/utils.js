let interval = null;
let currentUser = null;
let currentQuestion = null;
let timeLeft = 0;
let timerValue = 0;

function loadNavbar(selector = "#navbar") {
  fetch("../components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.querySelector(selector).innerHTML = data;
      if (window.location.href.includes("quiz.html")) checkQuizStatus();
      else if (window.location.href.includes("index.html"))
        localStorage.setItem("currentUser", null);
    })
    .catch((err) => console.error("Error loading navbar:", err));
}

function getQuesNumberClassName(i) {
  let className =
    "flex items-center justify-center p-2 rounded-full shadow w-8 md:w-10 h-8 md:h-10 text-sm md:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ";
  if (currentUser?.questions[i]?.yourAnswer !== "") {
    className = className + "bg-green-300";
  } else if (
    currentUser?.questions[i]?.yourAnswer === "" &&
    currentUser?.questions[i]?.timeTaken > 0 &&
    currentUser?.questions[i]?.timeTaken < 60
  ) {
    className = className + "bg-purple-300";
  } else if (currentUser?.questions[i]?.timeTaken >= 60) {
    className = className + "bg-gray-200";
  } else {
    className = className + "bg-gray-200";
  }
  return className;
}

function getDisabled(i) {
  return currentUser.questions[i].timeTaken >= 60 ? true : false;
}

function getPregressWidth() {
  const filterAns = currentUser?.questions.filter(
    (item) =>
      item.yourAnswer !== "" || (item.yourAnswer === "" && item.timeTaken > 0)
  );
  return (filterAns.length * 100) / currentUser?.questions.length;
}

function loadQuestions() {
  if (currentUser?.questions) {
    const container = document.getElementById("container");
    if (container) {
      for (let i = 0; i <= currentUser?.questions.length - 1; i++) {
        const div = document.createElement("button");
        div.id = `question-number-${i + 1}`;
        div.textContent = `${i + 1}`;
        div.onclick = () => saveNext(i);
        div.disabled = getDisabled(i);
        div.className = getQuesNumberClassName(i);
        container.appendChild(div);
      }
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
  document.getElementById("time-taken").textContent = formatTime(
    currentUser.questions.length * 60 - currentUser.totalTimeTaken
  );

  const question = document.getElementById("totalQues");
  currentUser.questions.forEach((ques) => {
    const tr = document.createElement("tr");
    tr.className = "p-2 even:bg-blue-100";
    const td1 = document.createElement("td");
    td1.className = "w-[70%] text-sm sm:text-base sm:w-[40%] p-2";
    td1.textContent = `Q${ques.id + 1}. ${ques.question}`;
    const td2 = document.createElement("td");
    td2.className = "w-[15%] hidden sm:table-cell";
    td2.textContent = ques.yourAnswer;
    const td3 = document.createElement("td");
    td3.className = "w-[15%] hidden sm:table-cell";
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
  timerValue =
    currentUser.questions[currentQuestion.id].timeTaken > 0
      ? 60 - currentUser.questions[currentQuestion.id].timeTaken
      : 60;
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
  userDetails.innerHTML = `${currentUser?.name} (${currentUser?.email})`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function remaningTimer() {
  const timerEl = document.getElementById("remaningTime");
  timeLeft =
    currentUser.totalTimeTaken === 0
      ? currentUser.questions.length * 60
      : currentUser.totalTimeTaken;
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
  question.innerHTML = `<span>Q${id + 1}.</span> ${questionText}`;
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
    input.checked = optionText === currentUser.questions[id].yourAnswer;

    const label = document.createElement("label");
    label.htmlFor = `option-${index}`;
    label.textContent = optionText;

    li.appendChild(input);
    li.appendChild(label);
    ul.appendChild(li);
  });
  startTimer();
}

const shuffleArray = (arr) => {
  const array = [...arr]; // create a shallow copy
  if (array.length === 0) return array; // handle empty array case
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIdx = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIdx]] = [arr[randomIdx], arr[i]];
  }
  return arr;
};

const urls = {
  cricket: "../mocks/cricket-data.json",
  html: "../mocks/html-css-data.json",
  javascript: "../mocks/javascript-data.json",
  react: "../mocks/react-data.json",
};

const setQuizUI = (ques) => {
  currentQuestion = ques;
  if (document.getElementById("user-detail"))
    document.getElementById("user-detail").style.display = "none";
  if (document.getElementById("quiz-questions"))
    document.getElementById("quiz-questions").style.display = "flex";
  const navbar = document.getElementById("nav-items");
  navbar.style.display = "none";
  document.getElementById("remaningTime").style.display = "flex";
  const options = [...ques.incorrect_answers, ques.correct_answer].sort(
    () => Math.random() - 0.5
  );
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  loadQuestions();
  remaningTimer();
  getOption(ques.id, ques.question, options);
  disableSubmit();
};

async function fetchQuestion() {
  const category = document.getElementById("category").value;
  const res = await fetch(urls[category]);
  const data = await res.json();
  const shuffeledQues = shuffleArray(data.results);
  const uniqueQues = uniqueArray(shuffeledQues).slice(0, 10);
  const ques = uniqueQues.map((item, index) => {
    return { ...item, id: index, yourAnswer: "", timeTaken: 0 };
  });
  currentUser.questions = ques;
  const index = ques.findIndex((item) => item.timeTaken > 0);
  setQuizUI(ques[index > -1 ? index : 0]);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function startQuiz() {
  stopTimer();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  if (name && email) {
    if (validateEmail(email)) {
      const rollNumber = Math.floor(100000 + Math.random() * 900000);
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const index = users.findIndex((user) => email === user.email);
      currentUser = {
        name: name,
        email: email,
        rollNumber: rollNumber,
        score: "",
        totalTimeTaken: 0,
        questions: [],
      };
      if (index !== -1) users[index] = { ...currentUser };
      else users.push(currentUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      fetchQuestion();
    } else {
      document.getElementById("enter-name").style.display = "none";
      document.getElementById("enter-email").style.display = "block";
    }
  } else {
    document.getElementById("enter-name").style.display =
      name == "" ? "block" : "none";
    document.getElementById("enter-email").style.display =
      email == "" ? "block" : "none";
  }
}

const saveNext = (index) => {
  const selected = document.querySelector('input[name="question"]:checked');
  currentUser.questions[currentQuestion.id].timeTaken = 60 - timerValue;
  currentUser.questions[currentQuestion.id].yourAnswer = selected?.value || "";
  const queNum = document.getElementById(
    `question-number-${currentQuestion.id + 1}`
  );
  queNum.disabled = getDisabled(currentQuestion.id);
  queNum.className = getQuesNumberClassName(currentQuestion.id);
  currentUser.questions[currentQuestion.id].timeTaken = 60 - timerValue;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  const progressWidth = getPregressWidth();
  const progress = document.getElementById("progress");
  progress.className = progress.className.replace(/w-\[\d+%\]/, "");
  progress.classList.add(`w-[${progressWidth}%]`);
  stopTimer();
  const nextQues =
    index !== undefined
      ? currentUser.questions[index]
      : currentUser.questions[currentQuestion.id + 1];
  if (nextQues) {
    const options = [
      ...nextQues.incorrect_answers,
      nextQues.correct_answer,
    ].sort(() => Math.random() - 0.5);
    currentQuestion = nextQues;
    getOption(nextQues.id, nextQues.question, options);
  }
  disableSubmit();
};

const disableSubmit = () => {
  let yourAns = currentUser.questions.some((ques) => ques.timeTaken === 0);
  document.getElementById("submitQuiz").disabled = yourAns;
};

function submitQuiz() {
  let score = 0,
    incorrect = 0,
    skipped = 0,
    notAttempted = 0;
  currentUser.questions.forEach((item) => {
    if (item.yourAnswer === item.correct_answer) {
      score++;
    } else if (item.timeTaken <= 60 && item.yourAnswer === "") {
      skipped++;
    } else if (
      item.yourAnswer !== "" &&
      item.yourAnswer !== item.correct_answer
    ) {
      incorrect++;
    } else if (item.timeTaken === 0 && item.yourAnswer === "") {
      notAttempted++;
    }
  });
  currentUser.incorrect = incorrect;
  currentUser.skipped = skipped;
  currentUser.notAttempted = notAttempted;
  currentUser.score = score;
  currentUser.totalTimeTaken = timeLeft;

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
  if (currentUser) {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    window.location.href = "review.html";
  } else {
    alert("User not found.");
  }
}

function checkQuizStatus() {
  const cUser = JSON.parse(localStorage.getItem("currentUser"));
  if (cUser?.questions.length > 0) {
    currentUser = cUser;
    const index = currentUser.questions.findIndex(
      (item) => item.timeTaken < 60 && item.yourAnswer === ""
    );
    setQuizUI(currentUser.questions[index]);
  }
}

function uniqueArray(array) {
  return [
    ...new Map(array.map((item) => [item.correct_answer, item])).values(),
  ];
}

if (window.location.href.includes("quiz.html"))
  window.addEventListener("beforeunload", function () {
    currentUser.totalTimeTaken = timeLeft;
    currentUser.questions[currentQuestion.id].timeTaken = 60 - timerValue;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  });
