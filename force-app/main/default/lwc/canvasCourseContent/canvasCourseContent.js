import { LightningElement,api,track } from 'lwc';

import getCourse from '@salesforce/apex/guestUserHandler.getCourse';

export default class CanvasCourseContent extends LightningElement {

  @api courseId;

  contentType;  

  @track courseDetails;

  selectedLesson;

  selectedSection;

  showcourseDetails=false;

  isvideo=false;

  isarticle=false;

 
  @api courseonboard(selectedSection,selectedLesson){

    this.selectedSection=selectedSection;

    console.log(`Course onboarding for ${selectedSection} section and ${selectedLesson} lesson`);

    this.courseDetails.forEach(section=>{
     
      if(section.Id===selectedSection){ // find the right course
        

        section.Lessons__r.forEach(lesson=>{


          console.log(`${lesson.Id} = ${selectedLesson}`);

          if(lesson.Id==selectedLesson){
            this.selectedLesson=lesson;
            this.showcourseDetails=true;
          }
        });



      }
    });



    // this.selectedLesson

    if(this.selectedLesson.Type__c==='Video'){
      this.isvideo=true;
      this.isarticle=false;
    } else if(this.selectedLesson.Type__c==='Article'){
      this.isvideo=false;
      this.isarticle=true;
    }



    
  }

connectedCallback(){

  if(this.courseId!=null){

    // console.log('Course id is received as  : '+ this.courseId);


    getCourse({searchCourseId:this.courseId})
    .then(data=>{
    

      data.forEach(item => {
       item.showSection=false;
      });

      console.log(data);

      this.courseDetails=data;
  
  
      const cdetails = new CustomEvent("coursedetailsretrieved",
      {
        detail:this.courseDetails
      }
      
      );
  
      this.dispatchEvent(cdetails);
  
  
    })
    .catch(err=>{
      this.showToastMsg(err,'error');
    });
  
  
  

  }




  }



showToastMsg(message,variant){
  const elem=this.template.querySelector('c-notify');
  if(elem){
    elem.showToast(message,variant);
  }
}

}