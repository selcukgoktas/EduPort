import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';



export default class MemberArealayout extends NavigationMixin(LightningElement) {

  canvasstyle='canvas';
  coursecardStyle='course-card';

  clientIp;


  guestId; // store on sessionStorage

  courseId; // store on localStorage 

  lessonId; // store on localStorage 

  selectedSection;

  courses=true;  

  showMemberArea=false;

  standardmenu=[
    {Id:"1",Name:"Home"},
    {Id:"2",Name:"Account"}

  ];

   @track sidemenu=[
    ...this.standardmenu
   

  ];

  @track coursecontent=[
    ...this.standardmenu
  ];


  

  constructor(){
    super();

  }




  connectedCallback(){

    fetch('https://api.ipify.org/?format=json').then(res=>{
    
  return res.json();
  
  
  })
  .then(data =>{
    

    this.clientIp=data.ip;
    console.log(this.clientIp);

    localStorage.setItem('IP',JSON.stringify(this.clientIp));

  })   
   .catch(err=>{
    console.log('IP ERR : '+ err);
   });

  





    console.log('Connected callback');

    this.guestId= sessionStorage.getItem('Gid');

    this.courseId = localStorage.getItem('cid');

    this.lessonId= localStorage.getItem('lid');

   

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



  showToastMsg(message,variant){
    const elem=this.template.querySelector('c-notify');
    if(elem){
      elem.showToast(message,variant);
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

    // const canvasshow=this.template.querySelector('[data-id="canvas"]');


 // marginLeft is not working  UPDATE THIS FROM CSS canvas-right {}
    // canvasshow.marginLeft='300px';

    sidebarshow.style.width='300px';

    this.canvasstyle='canvas-right';
    this.coursecardStyle='course-card-right';

    
  }


  closeNav(){

    /**
      document.getElementById("mySidebar").style.width = "0";
      document.getElementById("main").style.marginLeft = "0";



     */


      const sidebarhide = this.template.querySelector('[data-id="sidebar"]');

    //  const canvashide=this.template.querySelector('[data-id="canvas"]');

      // canvasshow.marginLeft='0';  // this is not working...


    sidebarhide.style.width='0';


    this.canvasstyle='canvas';
    this.coursecardStyle='course-card';

  }






  courseSelectedHandler(event){
  event.preventDefault();    

    if(event.detail!=1){   // if course is selected from CANVAS.
      this.courseId=event.detail;
      this.courses=false;
      

      console.log('event.detail - Course is Selected :'+ event.detail);

    }else if(event.target.dataset){  // if course is selected from side menu.

      console.log('event.target.dataset - Course is Selected :'+ event.target.dataset.id);
      if(event.target.dataset.id==1){  // HOME 
        console.log('HOME is Selected');
        this.courses=true;

      } else if(event.target.dataset.id==2){ // Account
        console.log('Account is Selected');
        this.courseId='ACCOUNT';
        this.courses=false;
        

      } else {  // COURSE SELECT
        console.log('Course is Selected');
        this.courseId=event.target.dataset.id;
        this.courses=false;
        
      }


      
    }

    // HIDE SIDE BAR END EXPAND CANVAS 

    const courseSelectSIDEBARhide = this.template.querySelector('[data-id="sidebar"]');

   
    courseSelectSIDEBARhide.style.width='0';


    this.canvasstyle='canvas';
    this.coursecardStyle='course-card';


  }






  courseretrieveHandler(event){
   

    if(event.detail){
      
      let courseData=JSON.parse(sessionStorage.getItem('list'));
    
      console.log(courseData);

     
     
      this.sidemenu=[
        ...this.standardmenu,
        ...courseData
      ];
      
     
    }else{
      
    }

  }




  courseDetailsHandler(event){

    // console.log('Course details is dispatched....');
    // console.log(event.detail);

    if(event.detail){

      this.coursecontent=[
        ...this.standardmenu,
        ...event.detail
      ];

    }

  }



  sectionSelectedHandler(event){
    event.preventDefault(); 
    
    console.log('Section selected :'+event.currentTarget.dataset.id);

    if(event.currentTarget.dataset.id==1){  // HOME 
      console.log('HOME is Selected');
      this.courses=true;

    } else if(event.currentTarget.dataset.id==2){ // Account
      console.log('Account is Selected');
      this.courseId='ACCOUNT';
      this.courses=false;
      

    } else {  // SECTION SELECT
      console.log('Section is Selected');

      this.selectedSection = event.currentTarget.dataset.id;
     
      this.coursecontent.forEach(section=>{
        if(section.Id===this.selectedSection){
            section.showSection=true;  // only one section can be opened.
        }else{
          section.showSection=false;
        }
          
      }

      );

      this.courses=false;



    }


  }


  lessonSelectedHandler(event){
    event.preventDefault(); 


    
    console.log('Lesson selected :'+event.currentTarget.dataset.id);
    this.lessonId=event.currentTarget.dataset.id;

    this.template.querySelector('c-canvas-course-content').courseonboard(this.selectedSection,this.lessonId);


    this.courses=false;

  }


}