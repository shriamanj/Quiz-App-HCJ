
# Quiz App HCJ

A modern web-based quiz application built with HTML, CSS, and JavaScript. This app allows users to take quizzes on various topics, including Cricket, ReactJS, HTML/CSS, and JavaScript. It features user registration, question shuffling, timers, score calculation, and review functionality.


## Features
- User registration and login
- Multiple quiz categories (Cricket, ReactJS, HTML/CSS, JavaScript)
- 20 random questions per quiz (shuffled)
- Timer for each question and total quiz time
- Score calculation and grading system
- Review of correct/incorrect answers after submission
- Responsive and accessible UI
- Persistent user data using localStorage


## Project Structure
```
quiz-app-HCJ/
├── index.html
├── components/
│   ├── admin.html
│   ├── contants.html
│   ├── head.html
│   ├── navbar.html
│   ├── quiz.html
│   ├── result.html
│   └── review.html
├── images/
│   ├── 3a.png
│   └── quiz.jpg
├── mocks/
│   ├── cricket-data.json      # Cricket quiz questions
│   ├── react-data.json        # ReactJS interview questions
│   ├── html-css-data.json     # HTML/CSS questions
│   ├── javascript-data.json   # JavaScript questions
├── utils/
│   └── utils.js               # Main JS logic and quiz engine
└── README.md
```


## How to Use
1. Clone the repository:
   ```
   git clone https://github.com/shriamanj/Quiz-App-HCJ.git
   ```
2. Open `index.html` in your browser.
3. Register or login to start a quiz.
4. Select a category and begin answering questions.
5. Submit the quiz to view your score and review answers.


## Customization
- Add or update quiz questions in the `mocks/` directory.
- Modify UI components in the `components/` folder.
- Main logic and utility functions are in `utils/utils.js`.


## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6)


## License
MIT License


## Author
- Aman Jain
- GitHub: [shriamanj](https://github.com/shriamanj)


---
Feel free to contribute or suggest improvements!
