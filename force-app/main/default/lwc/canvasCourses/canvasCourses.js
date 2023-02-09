import { LightningElement,api } from 'lwc';
import getCourses from '@salesforce/apex/guestUserHandler.getCourses';


export default class CanvasCourses extends LightningElement {


  courses;  // ListofCourses.
  @api cardstyle='course-card';
  @api courseid;

  showToastMsg(message,variant){
    const elem=this.template.querySelector('c-notify');
    if(elem){
      elem.showToast(message,variant);
    }
  }



  connectedCallback(){
    getCourses()
      .then(data=>{
        this.courses=data;
        // console.log(data);

        sessionStorage.setItem('list',JSON.stringify(this.courses));


        const clist = new CustomEvent("courseretrieved",
    {
      detail:'sessionStorage'
    }
    
    );

    this.dispatchEvent(clist);


      })
      .catch(err=>{
        this.showToastMsg(err,'error');
      });
  }


  clickcoursecard(event){
    // console.log(event.target.dataset.id);
    this.courseid=event.target.dataset.id;

    localStorage.setItem('cid',this.courseid);

    const courseidsendEvent = new CustomEvent("courseselected",
    {
      detail:this.courseid
    }
    
    );

    this.dispatchEvent(courseidsendEvent);

    
  }

 
}