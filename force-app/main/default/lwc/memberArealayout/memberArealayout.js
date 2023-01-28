import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class MemberArealayout extends NavigationMixin(LightningElement) {

  canvasstyle='canvas';

  guestId; // store on sessionStorage

  courseId; // store on localStorage 

  lessonId; // store on localStorage 


  showMemberArea=false;

  constructor(){
    super();

  }


  connectedCallback(){

    this.guestId= sessionStorage.getItem('Gid');

    this.courseId= localStorage.getItem('Gid');

    this.lessonId= localStorage.getItem('Gid');

    if(!this.courseId){
      // use it on html
    } else {
      // get the first course id
    }

    if(!this.lessonId){
      // use it on html
    } else {
      // Use the first lesson id 
    }

    console.log(this.guestId);

    if(!this.guestId){
      this.navto('memberlogin__c');
    } else{
      this.showMemberArea=true;
    }

  }



  navto(redirectPage) {
    // Use the basePath from the Summer '20 module to construct the URL

  console.log(`redirectPage   : ${redirectPage}`);


  this[NavigationMixin.Navigate]({
    type: 'comm__namedPage',
    attributes: {
        name: 'memberlogin__c'
    }
    });




  }




  openNav(){

    /**
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
     */

    const sidebarshow = this.template.querySelector('[data-id="sidebar"]');

    const canvasshow=this.template.querySelector('[data-id="canvas"]');


 // marginLeft is not working 
    canvasshow.marginLeft='250px';
    sidebarshow.style.width='250px';

    this.canvasstyle='canvas-right';

    
  }


  closeNav(){

    /**
      document.getElementById("mySidebar").style.width = "0";
      document.getElementById("main").style.marginLeft = "0";



     */


      const sidebarhide = this.template.querySelector('[data-id="sidebar"]');

      const canvashide=this.template.querySelector('[data-id="canvas"]');

   
      // marginLeft is not working 

      canvashide.marginLeft='0';
    sidebarhide.style.width='0';

    this.canvasstyle='canvas';

  }
}