function gotourl(){
    var input=document.getElementById("term").value;
    var offset=document.getElementById("offset").value;
    console.log(input);
    window.location.href=("api/imagesearch/"+input+"?offset="+offset);
    return false;
    }