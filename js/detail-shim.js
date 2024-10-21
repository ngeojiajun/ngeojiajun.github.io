window.addEventListener("load",()=>{
  const details=[...document.querySelectorAll("details")];
  function openOnlyThis(event){
    //close all except this
    details.filter(element=>element!=event.target).forEach(e=>e.open=false);
    //open this
    event.target.open=true;
  }
  details.forEach(e=>e.addEventListener("click",openOnlyThis));
})
