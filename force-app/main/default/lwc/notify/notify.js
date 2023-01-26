import { LightningElement,api } from "lwc";

export default class Notify extends LightningElement {

showNotification=false;

message='Account widgets was created.';

variant='info';


get icon(){
  return '/assets/icons/utility-sprite/svg/symbols.svg#'+this.variant;
}


get notifyClassses(){
  let variantCls = this.variant==='success' ? 'slds-theme_success' :
  this.variant==='warning' ? 'slds-theme_warning' :
  this.variant==='error' ? 'slds-theme_error':'slds-theme_info';

  return `slds-notify slds-notify_toast ${variantCls}`;
}


@api showToast(message,variant){
  this.message=message || 'No message Found';
  this.variant = variant || 'info';
  this.showNotification=true;

  setTimeout(()=>{
    this.showNotification=false;
  }, 5000);

}


}