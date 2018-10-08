var image = document.getElementById("add-image");
var checkHidden = document.getElementById("form-input");
var questionInput = document.getElementById("input-question");
var authorInput = document.getElementById("input-author");
var table = document.getElementsByTagName('table')[0];
var voteIcons = document.getElementsByClassName('vote-icon');
var userID = 1 + Math.random();
var userMakeVote = false; // đánh dấu người dùng vote câu hỏi hay chưa (trong trường hợp người dùng đăng nhập và mở 2 tab)
var socket = io();

function bagClick() {
    image.style.display = "none";
    checkHidden.style.display = "block";
}

function replyClick() {
    window.location.assign("ex.html");
}

function getVal() {
    if (questionInput.value.trim() === "") {
        questionInput.style.border = "1px solid red";
    }
    else {
        var author = authorInput.value.trim() ? authorInput.value.trim() : "Anonym";
        var newQuestion = {
            author,
            question: questionInput.value,
            id: Math.random(),
            userID
        };
        socket.emit('addQuestion', newQuestion);

        checkHidden.style.display = "none";
        image.style.display = "block";
        questionInput.style.border = "";
    }
    questionInput.value = "";
    document.getElementById("input-author").value = "";

}

function cancelAddQuestion() {
    questionInput.value = "";
    document.getElementById("input-author").value = "";
    questionInput.style.border = "2px solid #aaa";
    checkHidden.style.display = "none";
    image.style.display = "block";
}

// Thêm câu hỏi mới
function addQuestion(newQuestion) {
    var replyButton = document.createElement("input");
    replyButton.type = "button";
    replyButton.classList.add("reply-button");
    replyButton.value = "Reply";
    replyButton.onclick = this.replyClick;

    var newRow = table.insertRow(0);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);

    newRow.id = newQuestion.id;
    newRow.classList.add('question-block');
    cell1.innerHTML =
        "<i class=\"fas fa-caret-up vote-icon\"></i><br>" +
        "<span class=\"vote-count\">0</span><br>" +
        "<span>votes</span>";
    cell1.classList.add("vote-zone");
    cell2.innerHTML =
        `<span class="author">${newQuestion.author}</span><br>` +
        `<span class="question">${newQuestion.question}</span><br>` +
        "<br>" +
        "<br>" +
        "<input type=\"button\" class=\"reply-button\" value=\"Comments\">";
    // thêm sự kiện khi click vào tăng vote
    voteIcons[0].addEventListener("click", function () {
        userMakeVote = true; // đánh dấu người dùng đã vote câu hỏi
        this.classList.toggle('vote-icon-clicked');
        let countSpan = this.nextSibling.nextElementSibling;
        let count = 0;
        if (this.classList.contains('vote-icon-clicked')) {
            count = Number(countSpan.innerText) + 1;
        } else count = Number(countSpan.innerText) - 1;
        socket.emit('moreVote', {
            votes: count,
            questionID: this.parentElement.parentElement.id,
            userID
        });
    })
}

function handleVoteQuestion(icon, votes) {
    if (userID === votes.userID && !userMakeVote) {
        icon.classList.toggle('vote-icon-clicked');
    }
    userMakeVote = false; // reset lại dấu
    let count = icon.nextSibling.nextElementSibling;
    count.innerText = votes.votes;
}

// kênh thêm câu hỏi
socket.on('addQuestion', question => {
    addQuestion(question)
});

// kênh thêm vote cho câu hỏi
socket.on('moreVote', votes => {
    let questions = Array.from(table.children[0].children);
    let voteIndex = questions.findIndex(question => question.id === votes.questionID);
    handleVoteQuestion(voteIcons[voteIndex], votes);
});