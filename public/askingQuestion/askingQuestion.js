var questionInput = document.getElementById("input-question");
var authorInput = document.getElementById("input-author");
var doneButton = document.getElementById("done-button");
var cancelButton = document.getElementById("cancel-button");
var table = document.getElementsByTagName('table')[0];
var voteIcons = document.getElementsByClassName('vote-icon');
var userIdentify = document.querySelector('#user-id span');

// local variables
var userID = 1 + Math.random();
var userMakeVote = false; // đánh dấu người dùng vote câu hỏi hay chưa (trong trường hợp người dùng đăng nhập và mở 2 tab)
var socket = io();

userIdentify.innerText += userID;
// lấy dữ liệu từ server
axios.get('/api/question/')
    .then(questions => questions.data)
    .then(questions => {
        questions.forEach(question => {
            addQuestion(question)
        })
    })
    .catch(error => {
        console.log(error)
    });

function getVal() {
    if (questionInput.value.trim() === "") {
        questionInput.style.border = "1px solid red";
    }
    else {
        var user = authorInput.value.trim() ? authorInput.value.trim() : "Ẩn danh";
        var newQuestion = {
            user,
            question: questionInput.value
        };
        axios.post('/api/question/', newQuestion)
            .then(question => question.data)
            .then(question => {
                socket.emit('addQuestion', question);
            })
            .catch(error => {
                alert(error);
            });

        questionInput.style.border = "2px solid #aaa";
        authorInput.style.display = "none";
        doneButton.style.display = "none";
        cancelButton.style.display = "none";
    }
    questionInput.value = "";
    document.getElementById("input-author").value = "";

}

function focusFunction() {
    authorInput.style.display = "block";
    doneButton.style.display = "block";
    cancelButton.style.display = "block";
}

function cancelAddQuestion() {
    questionInput.value = "";
    document.getElementById("input-author").value = "";
    questionInput.style.border = "2px solid #aaa";
    authorInput.style.display = "none";
    doneButton.style.display = "none";
    cancelButton.style.display = "none";
}

// Thêm câu hỏi mới
function addQuestion(newQuestion) {
    var replyButton = document.createElement("input");
    replyButton.type = "button";
    replyButton.classList.add("reply-button");
    replyButton.value = "Reply";

    var newRow = table.insertRow(0);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);

    newRow.id = newQuestion._id;
    newRow.classList.add('question-block');
    cell1.innerHTML =
        "<i class=\"fas fa-caret-up vote-icon\"></i><br>" +
        "<span class=\"vote-count\">0</span><br>" +
        "<span>lượt</span>";
    cell1.classList.add("vote-zone");
    cell2.innerHTML =
        `<span class="author">${newQuestion.user}</span><br>` +
        `<span class="question">${newQuestion.question}</span>`;
    // xử lí khoảng xuống dòng khi có nhiều dòng được thêm vào
    let breakLines = newQuestion.question.length / 88; // mỗi dòng có trung bình 88 kí tự
    for (let i = 0; i < 3 - breakLines; i++) {
        cell2.innerHTML += '<br/>';
    }
    if (breakLines > 2) cell2.innerHTML += '<br/>';
    cell2.innerHTML += '<a type="button" href="/answer" class="reply-button">Phản hồi</a>';
    // sap xep lai cac cau hoi
    sortQuestions();
}

function handleVoteQuestion(icon, votes) {
    if (userID === votes.userID && !userMakeVote) {
        icon.classList.toggle('vote-icon-clicked');
    }
    userMakeVote = false; // reset lại dấu
    let count = icon.nextSibling.nextElementSibling;
    count.innerText = votes.votes;
    // sap xep lai cac cau hoi
    sortQuestions();
}

function sortQuestions() {
    let rows = Array.from(table.rows);
    // sắp xếp dựa trên số phiếu cho mỗi câu hỏi
    rows.sort((a, b) => Number(a.querySelector('.vote-zone .vote-count').innerText)
        < Number(b.querySelector('.vote-zone .vote-count').innerText));
    // gán lại giá trị cho DOM
    for (let i = 0; i < rows.length; i++) {
        table.rows[i].outerHTML = rows[i].outerHTML;
        addEventToVoteIcon(table.rows[i].querySelector('.vote-zone .vote-icon')) // them su kien cho cac icon
    }
}

function addEventToVoteIcon(icon) {
    icon.addEventListener("click", function () {
        userMakeVote = true; // đánh dấu người dùng đã vote câu hỏi
        this.classList.toggle('vote-icon-clicked');
        let countSpan = this.nextSibling.nextElementSibling;
        let count = 0;
        if (this.classList.contains('vote-icon-clicked')) {
            count = Number(countSpan.innerText) + 1;
        } else count = Number(countSpan.innerText) - 1;
        // đẩy dữ liệu qua kênh 'moreVoteQuestion'
        socket.emit('moreVoteQuestion', {
            votes: count,
            questionID: this.parentElement.parentElement.id,
            userID
        });
    })
}

// kênh thêm câu hỏi
socket.on('addQuestion', question => {
    addQuestion(question)
});

// kênh thêm vote cho câu hỏi
socket.on('moreVoteQuestion', votes => {
    let questions = Array.from(table.children[0].children);
    let voteIndex = questions.findIndex(question => question.id === votes.questionID);
    handleVoteQuestion(voteIcons[voteIndex], votes);
});