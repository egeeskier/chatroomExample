document.addEventListener("DOMContentLoaded", function () {

    //function immediately
    const cat = document.querySelector('#cat')
    const urlVar = new URLSearchParams(window.location.search)
    const category = urlVar.get('category')
    cat.innerHTML = (category && category.length > 0) ? category.toUpperCase() + "&nbsp;" : ""
    const socket = io();
    let Name = "Anonymous";

    //get DOM elements
    const nameButton = document.querySelector("#nameButton");
    const name = document.querySelector("#name");
    const msg = document.querySelector("#msg");
    const msgBox = document.querySelector("#msgBox");
    const send = document.querySelector("#send");
    const population = document.querySelector('#population')

    //on connection, join room
    socket.on('connect', () => {
        console.log('connected')
        socket.emit('joinRoom', category)
    })

    //Show modal onload, modal is not closed by keyboard or mouse
    $("#nameModal").modal({ backdrop: 'static', keyboard: false });

    //when enter is clicked
    nameButton.addEventListener("click", function () {
        if (name.value != "") {
            Name = name.value;
        }
        $("#nameModal").modal("hide");
    });

    //When message arrives from server.js call recievedMessage()
    socket.on("recieve_message", recievedMessage);
    socket.on("noRoom", () => {
        document.write('No such chatroom exists.')
    })
    socket.on('updateRoomCount', count => {
        population.innerHTML = count + '&nbsp;'
    })

    function sendMessage() {
        if (msg.value == "") {
            return;
        }
        let container = document.createElement("div");
        let text = document.createElement("span");
        var messageTime = new Date();
        console.log(messageTime)
        let time = document.createElement("span")
        time.innerHTML = messageTime
        container.classList.add("mt-2", "text-right");
        text.innerHTML = msg.value;
        text.classList.add("bg-dark", "text-light", "px-1", "py-1", "rounded");
        time.classList.add("bg-primary", "text-light", "px-1", "py-1","rounded");
        container.appendChild(text);
        container.appendChild(time)
        msgBox.appendChild(container);
        socket.emit("message", msg.value, Name, category);
        msg.value = "";
    }

    function recievedMessage(rmsg, rname) {
        let container = document.createElement("div");
        let rtext = document.createElement("span");
        rtext.innerHTML = "<strong>" + rname + "</strong>" + ": " + rmsg;
        rtext.classList.add("bg-dark", "text-light", "px-1", "py-1", "rounded");
        container.classList.add("text-left", "mt-2");
        container.appendChild(rtext);
        msgBox.appendChild(container);
    }

    //send button clicked
    send.addEventListener("click", sendMessage);
    msg.addEventListener("keypress", function (e) {
        let key = e.keyCode || e.which;
        if (key == 13) {
            sendMessage();
        }
    });


})
