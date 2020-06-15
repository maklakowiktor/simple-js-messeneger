var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.querySelectorAll(".myImg");
var modalImg = document.getElementById("img01");

function openImg(img){
    console.log('Click on image!');
    modal.style.display = "block";
    modalImg.src = img.src;
};

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

modal.onclick = function() {
  modal.style.display = "none";
};


