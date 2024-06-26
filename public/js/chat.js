const socket= io()
//elements

const $messageForm =document.querySelector("#message-form")
const $messageFormInput =$messageForm.querySelector("input")
const $messageFormButton =$messageForm.querySelector("button")
const $locationButton =document.querySelector("#send-location")
const $messages =document.querySelector("#messages")

//templates 
const messageTemplate =document.querySelector("#message-template").innerHTML
const locationTemplate =document.querySelector("#location-template").innerHTML
const sidebarTemplate =document.querySelector("#sidebar-template").innerHTML

//options
const {username ,room}=Qs.parse(location.search,{ignoreQueryPrefix : true})
const autoscroll =()=>{
    // new message
    const $newMessage = $messages.lastElementChild
    //hright of new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin =parseInt(newMessageStyles.marginBottom)
     const newMessageHeight =$newMessage.offsetHeight+newMessageMargin
    // visible height 
    const visibleHeight = $messages.offsetHeight
    // hright of message contaienr 
    const containerHeight =$messages.scrollHeight
   // hoe far to scroll
   const scrollOffset =$messages.scrollTop +visibleHeight

    if(containerHeight - newMessageHeight<= scrollOffset){
       $messages.scrollTop =$messages.scrollHeight
       
    }
    

    }

// Listening for incoming messages from the server
socket.on("message", (message) => {
    // Logging the received message to the console
    console.log(message);
    const html= Mustache.render(messageTemplate,{
   username:message.username,
        createdAt:moment(message.createdAt).format("h:mm a"),
        message:message.text

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()


});

socket.on('locationMessage',(url)=>{
    console.log(url);
   const html =Mustache.render(locationTemplate,{
    username:url.username,
    createdAt :moment(url.createdAt).format('h:mm a'),
    location : url.text
   })
   $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})  => {
const html = Mustache.render(sidebarTemplate,{
    room,
    users
})

document.querySelector("#sidebar").innerHTML=html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')
    const message =e.target.elements.message.value
   socket.emit('sendMessage',message,(error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value=''
    $messageFormInput.focus()

    if(error){
        return console.log(error);
    }

    console.log('the message is delivered ');
   })
})


$locationButton.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert('geolocation not supported')
    }
    $locationButton.setAttribute("disabled" ,'disabled')
navigator.geolocation.getCurrentPosition((position)=>{
// console.log(,);
socket.emit('sendLocation',{
latitude:position.coords.latitude,
longitude:position.coords.longitude
},()=>{
    console.log('location shared');
    $locationButton.removeAttribute('disabled')
})
})


})


socket.emit('join',{
    username,
    room
},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }

})