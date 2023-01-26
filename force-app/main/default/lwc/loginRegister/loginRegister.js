import { LightningElement,track } from "lwc";
import { NavigationMixin } from 'lightning/navigation';

import login from '@salesforce/apex/guestUserHandler.login';
import register from '@salesforce/apex/guestUserHandler.register';

export default class LoginRegister extends NavigationMixin(LightningElement) {
  
    @track register={
    Email__c:'',
    Password__c:'',
    First_Name__c:'',
    Last_Name__c:''
    
  }


   @track login={
    Email__c:'',
    Password__c:''
    
  }

  samepass='';


  logonUser;
 

  errMessage;

  recordid;

onchangeInputHandler(event){
  event.preventDefault();
  let val=event.target.value;
  let evt=event.target.name;

  switch (evt) {

    // Sign in LOGIN 
    case 'user':
      this.login.Email__c=val;
      break;

    case 'pass':
      this.login.Password__c=val;
      break;  


 // Sign up REGISTER 
    case 'userReg':
      this.register.Email__c=val;
      break; 


      case 'name':
      this.register.First_Name__c=val.split(' ')[0]; 
      this.register.Last_Name__c=val.split(' ')[1];
      


      break; 

    
    case 'passReg':
      this.register.Password__c=val;
    break;

    case 'passReg2':
      if(this.register.Password__c!=val){
        this.samepass='Please use the same Password';

       this.showToastMsg(this.samepass,'error');

      } else{
       this.samepass='Your Password Valid';
       // this.showToastMsg(this.samepass,'warning');
      }
      break;
  
    default:
      break;
  }



}


showToastMsg(message,variant){
  const elem=this.template.querySelector('c-notify');
  if(elem){
    elem.showToast(message,variant);
  }
}



signInClick(){

  login({singleGuestUser:this.login})
   .then(response=>{

    console.log('Login Response : ');
     console.log(response);
     
     this.logonUser=response;


    this.showToastMsg(`Login Succesful as ${response.First_Name__c} ${response.Last_Name__c}`,'success');

    sessionStorage.setItem('Gid',response.Id); // Return Guest_User__c

    this.navtoMemberArea();
 


       
                
 
   })
   .catch(error=>{
    console.log(error);
     const evt = new ShowToastEvent({
       title: 'Login Error ',
       message: error.body.message ,
       variant: 'Error',
       mode: 'dismissable'
   });
   this.dispatchEvent(evt);
   this.successEvent=false;
 
   });

}

signUpClick(){

  if(this.samepass=='Your Password Valid'){
    console.log('Guest User will be register');
    console.log(this.register);

    register({singleGuestUser:this.register})
    .then(response=>{
      console.log(response); // Return Recordid

      // Set Guest User Id to Browser Storage

      sessionStorage.setItem('Gid',response); // Return Recordid

     
     this.showToastMsg(`Your account is created by ${response} this Id.`,'success');

     this.navtoMemberArea();

    


    })
    .catch(error=>{
      console.log(error);

      console.log(error.message);

      if(error.body.message.includes('DUPLICATE_VALUE')){
      this.errMessage='You already registered with the same email. Please use Sign In Tab. If you forgot your password please click the password forgot link';
      this.showToastMsg(this.errMessage,'error');

    }



    this.showToastMsg(this.errMessage,'error');

    });



    } else {

   
    this.showToastMsg(' Please Use the Same Password to Verify' ,'error');
  }
  



}


navtoMemberArea() {
    // Use the basePath from the Summer '20 module to construct the URL
    this[NavigationMixin.Navigate]({
        type: 'comm__namedPage',
        attributes: {
            name: 'memberarea__c'
      }
    });
}


connectedCallback(){
  console.log('Checking Session....');

  let sessionID = sessionStorage.getItem('Gid');

  console.log(sessionID);

  if(sessionID){
    this.navtoMemberArea();
  }

}


}