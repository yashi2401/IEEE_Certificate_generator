const inputs = document.querySelectorAll('.input');
const loadingBtn = document.getElementById('loading');
//Disable loading button
loadingBtn.style.display='none';

function focusFunc() {
  let parent = this.parentNode.parentNode;
  parent.classList.add('focus');

}

function blurFunc() {
  let parent = this.parentNode.parentNode;
  if(this.value == ""){
    parent.classList.remove('focus');
  }
}
inputs.forEach(input => {
  input.addEventListener('focus', focusFunc);
  input.addEventListener('blur', blurFunc);

});

// ....................Donwloading the Canvas Images........................

function download_image(){
  var canvas = document.getElementById("canvas");
  image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  var link = document.createElement('a');
  link.download = "download.png";
  link.href = image;
  link.click();
}

var xVal, yVal, imageLink, participantsListLink, ddArr=[];

//Fetch All the events from the backend
window.onload = fetchEventsFromAPI = async () => {

  const response = await fetch('https://auto-certi-generator.azurewebsites.net/getAllEvents');
  ddArr = await response.json();
  //console.log(ddArr)
  var ddlEvents = document.getElementById("event");

  //populate the dropdown
  for (var i = 0; i < ddArr.length; i++) {
      var option = document.createElement("OPTION");
      option.innerHTML = ddArr[i].val;
      option.value = ddArr[i].row;
      ddlEvents.options.add(option);
  }
}

var x = document.getElementById('hidBox')
x.style.display = "none";
//Executed for every change in dropdown value
document.getElementById("event").addEventListener('change',async function(){

  //Shows email and name fields, only  if the value of the dropdown is not default
  if(this.value=='default'){
    x.style.display = "none";
  }else{
    x.style.display = "block";
  }
});

//Send form information from frontend to backend
function submitDetails(){
  var form_container=  document.getElementById('login-container');
  var name = document.getElementById("name").value;
  var email = document.getElementById("emailID").value;
  var event = document.getElementById("event").value;
  if(name=="" || email==""){
    window.alert("Please enter the fields")
  }
  else{
  form_container.style.display ="none";
  loadingBtn.style.display ="block";
  var http = new XMLHttpRequest();
  axios.post('https://auto-certi-generator.azurewebsites.net/checkAuthenticity',{
    "name": name,
    "email": email,
    'eventID': event
  })
  .then(res=>{
    loadingBtn.style.display='none';
    if(!res.data.msg){
      var imgAPI=convertImageToAPI(res.data.imageLink)
      var capName=capitalizeFirstLetter(name)
      addTextToImage(capName,res.data.xVal,res.data.yVal,imgAPI)
    }
    else{
      window.alert(res.data.msg)
      form_container.style.display ="block";
    }
  })
 }
}

//google drive image (photo needs to be 1080X720px)
function addTextToImage(name,x,y,imgSRC) {
 var canvas = document.getElementById("canvas");
 var context = canvas.getContext("2d");
 var imageObj = new Image();
 imageObj.onload = function(){
     context.drawImage(imageObj, 0, 0);
     context.font = "40px Calibri";
     context.fillText(name, x-(context.measureText(name).width/2), y);
     window.alert('Certificate will appear on your screen after you click on "OK" button.\nFollow These steps to download your certificate\n1.Right click on the your certificate\n2.Select "Save image as" option\n3.Change the filename &download ')
 };
 imageObj.src = imgSRC;
}

//Convert google drive image link to API
function convertImageToAPI(img){
  var imgID=img.split("/")[5];
  var convertedAPI="https://drive.google.com/uc?id="+imgID;
  return convertedAPI;
}

//To capitalize first letter of name
function capitalizeFirstLetter(str) {
  str = str.split(" ");
  for (let i = 0, x = str.length; i < x; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].substr(1);
  }
  return str.join(" ");
}
