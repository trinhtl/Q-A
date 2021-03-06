// Thêm câu hỏi mới
function addQuestion(newQuestion) {
    let replyButton = document.createElement("input");
    replyButton.type = "button";
    replyButton.classList.add("reply-button");
    replyButton.value = "Reply";

    let newRow = table.insertRow(0);

    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);

    newRow.data = {
        postTime: newQuestion.postTime
    };
    newRow.id = newQuestion._id;
    newRow.classList.add('question-block');
    cell1.innerHTML =
        "<i class=\"fas fa-caret-up vote-icon\"></i><br>" +
        `<span class=\"vote-count\">${newQuestion.vote}</span><br>` +
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
    count.innerText = votes.vote;
    // sap xep lai cac cau hoi
    sortQuestions();
}

function sortQuestions() {
    let rows = Array.from(table.rows);
    // sắp xếp dựa trên số phiếu cho mỗi câu hỏi
    rows.sort((a, b) => {
        const count_a = Number(a.querySelector('.vote-zone .vote-count').innerText),
              count_b = Number(b.querySelector('.vote-zone .vote-count').innerText);
        return compare(count_b, count_a);
    });
    // nhóm các câu hỏi cùng số vote
    rows = rows.reduce((accumulator, currentValue) => {
        let currentArray = accumulator[accumulator.length - 1];
        if (accumulator.length === 0) {
            accumulator.push([]);
            accumulator[accumulator.length - 1].push(currentValue);
        } else {
            const currentItemVote = currentValue.querySelector('.vote-zone .vote-count').innerText,
                  previousItemVote = currentArray[currentArray.length - 1].querySelector('.vote-zone .vote-count').innerText;
            if (currentItemVote !== previousItemVote) {
                accumulator.push([]);
                accumulator[accumulator.length - 1].push(currentValue);
            } else {
                currentArray.push(currentValue);
            }
        }
        return accumulator;
    }, []);
    // sắp xếp nhóm các câu hỏi theo thòi gian được đăng lên
    rows = rows.map(sameVoteRows => sameVoteRows.sort((a, b) => {
        const postTime_a = a.data.postTime,
              postTime_b = b.data.postTime;
        return compare(postTime_b, postTime_a);
    }));
    rows = rows.reduce((accumulator, currentValue) => {
        accumulator.push(...currentValue);
        return accumulator;
    }, []);
    // gán lại giá trị cho DOM
    for (let i = 0; i < rows.length; i++) {
        table.rows[i].outerHTML = rows[i].outerHTML;
        table.rows[i].data = rows[i].data;
        table.rows[i].querySelector('.vote-zone .vote-icon').addEventListener('click', handleIconClick) // them su kien cho cac icon
    }
}

// hàm xử lí sự kiện icon click
function handleIconClick() {
    // đánh dấu người dùng đã vote câu hỏi
    userMakeVote = true;
    this.classList.toggle('vote-icon-clicked');
    let countSpan = this.nextSibling.nextElementSibling;
    let count = 0;
    const questionID = this.parentElement.parentElement.id;

    if (this.classList.contains('vote-icon-clicked')) {
        count = Number(countSpan.innerText) + 1;
    } else count = Number(countSpan.innerText) - 1;
    countSpan.innerHTML = loader.outerHTML;
    // update vote cho câu hỏi lên server
    this.removeEventListener('click', handleIconClick);
    axios.put(`/api/question/${questionID}`, {vote: count})
        .then(question => question.data)
        .then(question => {
            // đẩy dữ liệu qua kênh 'moreVoteQuestion'
            socket.emit('moreVoteQuestion', {
                ...question,
                userID
            });
        })
        .catch(error => {
            console.log(error)
        })
}

// hàm so sánh
function compare(val_1, val_2) {
    if (val_1 < val_2) {
        return -1;
    } else if (val_1 > val_2) {
        return 1;
    }
    return 0;
}

// kênh thêm câu hỏi
socket.on('addQuestion', question => {
    addQuestion(question)
});

// kênh thêm vote cho câu hỏi
socket.on('moreVoteQuestion', votes => {
    let questions = Array.from(table.children[0].children);
    let voteIndex = questions.findIndex(question => question.id === votes._id);
    handleVoteQuestion(voteIcons[voteIndex], votes);
});