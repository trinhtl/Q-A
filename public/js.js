var image = document.getElementById("add-image");
var checkHidden = document.getElementById("form-input");
var questionInput = document.getElementById("input-question");
var authorInput = document.getElementById("input-author");
var table = document.getElementsByTagName('table')[0];
var socket = io();

function bagClick(){
	image.style.display = "none";
	checkHidden.style.display = "block";
}
 
function replyClick(){
	window.location.assign("ex.html");
}


function getVal(){
	if(questionInput.value.trim() === ""){
		questionInput.style.border = "1px solid red";
	}
	else{
		var author = authorInput.value.trim() ? authorInput.value.trim() : "Anonym";
        var newQuestion = author + ": " + questionInput.value;
        socket.emit('vote', newQuestion);

		checkHidden.style.display = "none";
		image.style.display = "block";
		questionInput.style.border = "";
	}
	questionInput.value = "";
	document.getElementById("input-author").value = "";

}

function cancelAddQuestion(){
	questionInput.value = "";
	document.getElementById("input-author").value = "";
	questionInput.style.border = "2px solid #aaa";
	checkHidden.style.display = "none";
	image.style.display = "block";
}

// Thêm câu hỏi mới
function addQuestion(newQuestion) {
    var makeID = Math.random();
    var replyButton = document.createElement("input");
    replyButton.type = "button";
    replyButton.id = makeID;
    replyButton.classList.add("reply-button");
    replyButton.value = "Reply";
    replyButton.onclick = this.replyClick;

    var newRow = table.insertRow(0);

    var cel1 = newRow.insertCell(0);
    var cel2 = newRow.insertCell(1);

    cel1.innerHTML = newQuestion;
    cel1.id = makeID;
    cel2.appendChild(replyButton);
}

socket.on('vote', question => {
	addQuestion(question)
});
