var commentInput = document.getElementById("comment-text");
var comments = document.getElementById('comment-box');
var commentsNumber = document.getElementById('comment-number');
var upVoteBtns = document.getElementsByClassName('up-vote');
var downVoteBtns = document.getElementsByClassName('down-vote');
var userID = 1 + Math.random();

var socket = io(); // kênh truyền dữ liệu

function display_enter() {
    if (document.getElementById("enter-button").style.display == "none") {
        document.getElementById("enter-button").style.display = "block";
    }

}

function add_Cmt() {
    var content = commentInput.value;

    // đẩy dữ liệu qua kênh 'addComment'
    socket.emit('addComment', {
        comment: content,
        id: Math.random().toString(),
        userID
    });

    commentInput.value = "";
}

// đẩy comment vào DOM
function addCommentToDOM(commentData) {
    var comment = document.createElement('div');
    comment.classList.add('comment');
    comment.id = commentData.id; // thêm id cho mỗi comment
    comment.innerHTML =
        "<div class=\"people\">Hiep Nguyen •</div>" +
        "<div class=\"time\">7 hours ago</div>" +
        `<p class="comment-content">${commentData.comment}</p>` +
        "<div class=\"vote-area\">" +
            "<div style=\"float: left;\">" +
                "<span class=\"upVote-count\">0</span>\n" +
                `<button class=\"up-vote\" ><i class=\"fa fa-angle-up\"></i></button> ` +
                "<span style=\"color:#d6d6d6\">|</span>" +
            "</div>" +
            "<div>" +
                "<span class=\"downVote-count\" >0</span> " +
                "<button class=\"down-vote\" ><i class=\"fa fa-angle-down\"></i></button> " +
            "</div>" +
        "</div>";
    comments.append(comment);

    // cap nhat lai so luong comment
    commentsNumber.innerText = (Number(commentsNumber.innerText) + 1).toString();
    // thêm sự kiện tăng vote và giảm vote khi click button
    upVoteBtns[upVoteBtns.length - 1].addEventListener('click', function() {
        let count = this.previousElementSibling;
        // đẩy dữ liệu qua kênh 'moreVoteComment'
        socket.emit('moreVoteComment', {
            type: 'upVote',
            count: Number(count.innerText) + 1,
            commentID: this.parentElement.parentElement.parentElement.id,
            userID
        })
    });
    downVoteBtns[upVoteBtns.length - 1].addEventListener('click', function() {
        let count = this.previousElementSibling;
        // đẩy dữ liệu qua kênh 'moreVoteComment'
        socket.emit('moreVoteComment', {
            type: 'downVote',
            count: Number(count.innerText) + 1, // can 2 thuoc tinh dem
            commentID: this.parentElement.parentElement.parentElement.id,
            userID
        })
    });
}

function handleVoteComment(voteButton, votes) {
    voteButton.previousElementSibling.innerText = votes.count;
    voteButton.firstChild.classList.add('vote-icon-clicked');
}

// kênh thêm comment
socket.on('addComment', comment => {
    addCommentToDOM(comment)
});
// kênh thêm vote
socket.on('moreVoteComment', voteData => {
    let comments = Array.from(document.getElementsByClassName('comment'));
    let voteIndex = comments.findIndex(comment => comment.id === voteData.commentID);
    if (voteData.type === 'upVote') {
        handleVoteComment(upVoteBtns[voteIndex], voteData)
    } else {
        handleVoteComment(downVoteBtns[voteIndex], voteData)
    }
});