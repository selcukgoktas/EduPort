import { LightningElement, track, api } from "lwc";
import { Card } from "./card";
import { Payment } from "./payment";



import crypto64 from "@salesforce/apex/tools.crypto64";

import senddata from "@salesforce/apex/iyzico.senddata";


export default class CreditCard extends LightningElement {

  @api paymentMethod = "Credit Card";
  @track paymentOptions = [
    { label: "Credit Card", value: "Credit Card", selected: true },
    { label: "Purchase Order", value: "Purchase Order" },
    { label: "Check", value: "Check" }
  ];

@track card;
valid = false;
cardNumberValid = false;
cardHolderNameValid = false;
cardExpiryValid = false;
cardCVCValid = false;

cardNumberTouched = false;
cardHolderNameTouched = false;
cardExpiryTouched = false;
cardCVCTouched = false;

cardNumber = "";
cardHolderName = "";
cardExpiry = "";
cardCVC = "";

cardDetails;

headerAuth;
apikey='sandbox-MyPcbCq4fvHLo44Nn4jeoLyc5SRMAhrA';
secretkey='sandbox-aCqYcAlvR7nArT2zldmilEsptEoRdJaa';


cardUserKey;
cardToken;


cardInformation = {
  cardAlias: null,
  cardNumber: null,
  expireYear: null,
  expireMonth: null,
};


cardModel = {
  locale:null,
  conversationId:null,
  externalId: null,
  email: null,
  cardUserKey: null,
  card: this.cardInformation
};


paymentCard = {
  cardHolderName: null,
  cardNumber: null,
  expireYear: null,
  expireMonth: null,
  cvc: null,
  registerCard: null,
  cardAlias: null,
  cardToken: null,
  cardUserKey: null
};


shippingAddress = {
  address: null,
  zipCode: null,
  contactName: null,
  city: null,
  country: null
};

billingAddress = {
  address: null,
  zipCode: null,
  contactName: null,
  city: null,
  country: null
};

basketItems = [];

buyer = {
  id: null,
  name: null,
  surname: null,
  identityNumber: null,
  email: null,
  gsmNumber: null,
  registrationDate: null,
  lastLoginDate: null,
  registrationAddress: null,
  city: null,
  country: null,
  zipCode: null,
  ip: null
};

paymentModel = {
  locale: null,
  conversationId: null,
  price: null,
  paidPrice: null,
  installment: null,
  paymentChannel: null,
  basketId: null,
  paymentGroup: null,
  paymentCard: this.paymentCard,
  buyer: this.buyer,
  shippingAddress: this.shippingAddress,
  billingAddress: this.billingAddress,
  basketItems: this.basketItems,
  currency: null,
  
};


clientIp;


nullClear=(obj) => {
  for (var member in obj) {
      
      if(obj[member] === null) {    
          delete obj[member];
      }
      else if (typeof obj[member] === 'object'){
       
          obj[member]=this.nullClear(obj[member]);
          if(Object.keys(obj[member]).length===0){
              delete obj[member];
          }
      }
  }
  
  return obj;
}



jsonToObj=(jsonString,workobj)=> {
  var parsedJsonString = JSON.parse(jsonString)


  let basketItem = {
    id: null,
    price: null,
    name: null,
    category1: null,
    category2: null,
    itemType: null,
    subMerchantKey:null,
    subMerchantPrice: null
  };

  for(var key in parsedJsonString) {
      
      if(parsedJsonString.hasOwnProperty(key)) {
      
          if (typeof parsedJsonString[key] === 'object') {

            
          
              if(Array.isArray(parsedJsonString[key])){
                  for(var i = 0; i < parsedJsonString[key].length; i++){
                      if(key =="basketItems"){
                          // this.obj[key].push(new BasketItem());

                         
                          workobj={
                            ...workobj,
                            [key]:this.basketItems
                          }

                          // console.log('workobj BEFORE BASKET');
                          // console.log(JSON.parse(JSON.stringify(workobj)));
                          // this.obj[key][i]=this.jsonToObj(JSON.stringify(parsedJsonString[key][i]))

                          workobj={
                            ...workobj,
                            [key]:[
                              ...workobj[key],
                              this.jsonToObj(JSON.stringify(parsedJsonString[key][i]),workobj[key][i])
                            ]
                          }

                          // console.log('workobj AFTER BASKET');
                          // console.log(JSON.parse(JSON.stringify(workobj)));

                      }else {
                          // this.obj[key][i] = parsedJsonString[key][i];

                          workobj={
                            ...workobj,
                            [key]:[
                            ...workobj[key],
                            parsedJsonString[key][i]
                            ]

                          }
                      }
                  }
              }else{
                // console.log('KEY =>' +key); // send whole model as obj
                // this.obj[key] = this.jsonToObj(JSON.stringify(parsedJsonString[key])) // <= obj[key]


                /*
                
                card {   
                  card:
                }

                */

                workobj={
                  ...workobj,
                  [key]:this.jsonToObj(JSON.stringify(parsedJsonString[key]),workobj[key])
                }


               

              }
          }else{
              // this.obj[key] = parsedJsonString[key];

              // these elements are not object....

          
              if(key==='card'){

                workobj={
                 
                  [key]: parsedJsonString[key]
                  
                }

              } else {
                workobj={
                  ...workobj,
                  [key]: parsedJsonString[key]
                  
                }

              }
       }
          
      }
  }
  workobj = this.nullClear(workobj);
  
  return workobj;
}

generateRequestString = (obj) => {
  var isArray = Array.isArray(obj);
  
  var requestString = '[';
  for (var i in obj) {
    
   

      var val = obj[i];
      if (!isArray) {
          requestString += i + '=';
      }
      if (typeof val === 'object') {
          requestString += this.generateRequestString(val);
      } else {
          requestString += val;
      }
      requestString += isArray ? ', ' : ',';
  }
  requestString = requestString.slice(0, (isArray ? -2 : -1));
  requestString += ']';
  return requestString;
  
}   


async handleSubs(event){
  


    // create user if no...

    // 4766620000000001


    let expireyear='20'+this.cardExpiry.split('/')[1];
    let expiremonth=this.cardExpiry.split('/')[0];

    let cc=this.cardNumber.replaceAll(' ','');
    expireyear=expireyear.replaceAll(' ','');

    let endpoint = 'https://sandbox-api.iyzipay.com/cardstorage/card';
    let reqObj={
      "locale": "tr",
      "conversationId": "2222",
      "externalId": "2222",
      "email": "lwc@ylwc.com",
      "card": {
          "cardAlias": this.cardHolderName,
          "cardNumber": cc,
          "expireYear": expireyear,
          "expireMonth": expiremonth,
          "cardHolderName": this.cardHolderName
      }
  };






  let requestModel = this.cardModel;
 
  requestModel = this.jsonToObj(JSON.stringify(reqObj),requestModel);
  // console.log('ADD CARD requestModel');
  // console.log(JSON.stringify(requestModel));

  let reqstr = this.generateRequestString(requestModel);  
  // console.log('ADD CARD reqstr');
  // console.log(reqstr);

// ADD CARD
await crypto64({
  requestString:reqstr,
  apiKey:this.apikey,
  secretKey:this.secretkey
})
.then(data => {
  // console.log('returned authorization ADD CARD: '+ data);
  this.headerAuth=data;
})
.catch(err=>{
  console.log(err);
});



await senddata({url:endpoint,
headerAuth:this.headerAuth,
bodyobj:JSON.stringify(reqObj)})
.then(responseObj=>{

  responseObj = JSON.parse(responseObj);

  // console.log(responseObj);
  // console.log(JSON.stringify(responseObj));

  this.cardUserKey = responseObj.cardUserKey;
  this.cardToken = responseObj.cardToken;
  let lastFourDigits = responseObj.lastFourDigits;
  let cardType = responseObj.cardType;
  let cardBankName= responseObj.cardBankName;
  let status = responseObj.status;
  let systemTime=responseObj.systemTime;
  let conversationId=  responseObj.conversationId;
  let externalId= responseObj.externalId;

// console.log(this.cardUserKey);
// console.log(this.cardToken);

})
.catch(err=>{console.log(err)});



let payEndpoint ='https://sandbox-api.iyzipay.com/payment/auth';
let payreqObj={
  "locale": "tr",
  "conversationId": "2222",
  "price": "189.0",
  "paidPrice": "189.0",
  "installment": 1,
  "paymentChannel": "WEB",
  "basketId": "B67832",
  "paymentGroup": "PRODUCT",
  "paymentCard": {
  "cardUserKey": this.cardUserKey,
  "cardToken": this.cardToken
 
  },
  "buyer": {
      "id": "BY789",
      "name": "x",
      "surname": "y",
      "identityNumber": "74300864791",
      "email": "x@y.com",
      "gsmNumber": "+905350000000",
      "registrationDate": "2013-04-21 15:12:09",
      "lastLoginDate": "2023-02-08 12:43:35",
      "registrationAddress": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
      "city": "Istanbul",
      "country": "Turkey",
      "zipCode": "34732",
      "ip": this.clientIp
  },
  "shippingAddress": {
      "address": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
      "zipCode": "34742",
      "contactName": "x y",
      "city": "Istanbul",
      "country": "Turkey"
  },
  "billingAddress": {
      "address": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
      
      "contactName": "x y",
      "city": "Istanbul",
      "country": "Turkey"
  },
  "basketItems": [
      {
          "id": "BI101",
          "price": "189.0",
          "name": "Salesforce Software",
          "category1": "Software",
          
          "itemType": "VIRTUAL"
      }
     
  ],
  "currency": "TRY"
}


// console.log(JSON.parse(JSON.stringify(payreqObj)));



let payrequestModel = this.paymentModel;
payrequestModel = this.jsonToObj(JSON.stringify(payreqObj),payrequestModel);
// console.log('PAY payrequestModel');
// console.log(JSON.stringify(payrequestModel));

let payreqstr = this.generateRequestString(payrequestModel);  
// console.log('PAY payreqstr');
// console.log(payreqstr);


// PAYMENT 
await crypto64({
  requestString:payreqstr,
  apiKey:this.apikey,
  secretKey:this.secretkey
}).then(data => {
  // console.log('returned authorization PAYMENT : '+ data);
  this.headerAuth=data;})
.catch(err=>{
  console.log(err);
});

console.log('PAY ENDPOINT URL ' + payEndpoint);

await senddata({url:payEndpoint,
  headerAuth:this.headerAuth,
  bodyobj:JSON.stringify(payreqObj)})
.then(paydata=>{
  console.log('PAY SUCCESS');
  // console.log(paydata);
})
.catch(payErr=>{
  console.log('PAYMENT ERROR');
  console.log(payErr);
});



  
  }










  connectedCallback() {



   this.clientIp = localStorage.getItem('IP');

   if(this.clientIp==null){

    fetch('https://api.ipify.org/?format=json').then(res=>{
    
    return res.json();
    
    
    })
    .then(data =>{
      
  
      this.clientIp=data.ip;
      console.log(this.clientIp);
  
    })   
     .catch(err=>{
      console.log('IP ERR : '+ err);
     });
  
   }

    //copy public attributes to private ones
    var self = this;
    //debugger;
    window.setTimeout(() => {
      self.card = new Card({
        //reference to this object so will work with web components
        context: self,
        // a selector or DOM element for the form where users will
        // be entering their information
        form: self.template.querySelector(".cc-input"),
        // a selector or DOM element for the container
        // where you want the card to appear
        container: ".cc-wrapper", // *required*
        width: 250, // optional — default 350px
        formatting: true, // optional - default true
        // Strings for translation - optional
        messages: {
          validDate: "valid\ndate", // optional - default 'valid\nthru'
          monthYear: "mm/yyyy" // optional - default 'month/year'
        },
        // Default placeholders for rendered fields - optional
        placeholders: {
          number: "•••• •••• •••• ••••",
          name: "Full Name",
          expiry: "••/••",
          cvc: "•••"
        },
        masks: {
          cardNumber: "•" // optional - mask card number
        },
        // if true, will log helpful messages for setting up Card
        debug: true // optional - default false
      });
    }, 50);
  }
  handleCCInput(event) {
    this.cardNumber = event.target.value;
    this.cardNumberValid = this.getIsValid(this.cardNumber, "cardNumber");
    this.cardNumberTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  handleNameInput(event) {
    this.cardHolderName = event.target.value;
    this.cardHolderNameValid = this.getIsValid(this.cardHolderName, "cardHolderName");
    this.cardHolderNameTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  handleExpiryInput(event) {
    this.cardExpiry = event.target.value;
    this.cardExpiryValid = this.getIsValid(this.cardExpiry, "cardExpiry");
    this.cardExpiryTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  handleCVVInput(event) {
    this.cardCVC = event.target.value;
    this.cardCVCValid = this.getIsValid(this.cardCVC, "cardCVC");
    this.cardCVCTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  showFeedback() {
    if (!this.cardNumberValid && this.cardNumberTouched) {
      //show error label
      this.template.querySelectorAll(".cardNumberError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardNumberFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardNumberError")[0].classList.add("slds-hide");
      this.template
        .querySelectorAll(".cardNumberFormElement")[0]
        .classList.remove("slds-has-error");
    }
    if (!this.cardHolderNameValid && this.cardHolderNameTouched) {
      //show error label
      this.template.querySelectorAll(".cardNameError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardNameFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardNameError")[0].classList.add("slds-hide");
      this.template.querySelectorAll(".cardNameFormElement")[0].classList.remove("slds-has-error");
    }
    if (!this.cardExpiryValid && this.cardExpiryTouched) {
      //show error label
      this.template.querySelectorAll(".cardExpiryError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardExpiryFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardExpiryError")[0].classList.add("slds-hide");
      this.template
        .querySelectorAll(".cardExpiryFormElement")[0]
        .classList.remove("slds-has-error");
    }
    if (!this.cardCVCValid && this.cardCVCTouched) {
      //show error label
      this.template.querySelectorAll(".cardCVVError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardCVVFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardCVVError")[0].classList.add("slds-hide");
      this.template.querySelectorAll(".cardCVVFormElement")[0].classList.remove("slds-has-error");
    }
  }
  //this syntax means we should be able to leave off 'this'
  checkIfComplete = () => {
    if (
      this.cardNumberValid &&
      this.cardHolderNameValid &&
      this.cardExpiryValid &&
      this.cardCVCValid
    ) {
      //send a message
      const detail = {
        type: "cardComplete",
        value: {
          cardNumber: this.cardNumber,
          cardHolderName: this.cardHolderName,
          cardCVV: this.cardCVC,
          cardExpiry: this.cardExpiry,
          cardType: this.card.cardType
        }
      };
      this.despatchCompleteEvent(detail);

      // console.log(detail);

      this.cardDetails=detail;

    } else {
      // LCC.sendMessage({ type: 'cardIncomplete' });
      this.despatchIncompleteEvent();
    }
  };
  despatchCompleteEvent(cardData) {
    const changeEvent = new CustomEvent("cardComplete", { detail: cardData });
    this.dispatchEvent(changeEvent);
  }
  despatchIncompleteEvent() {
    const changeEvent = new CustomEvent("cardIncomplete", { detail: {} });
    this.dispatchEvent(changeEvent);
  }
  handlePaymentMethodChange(event) {
    const selectedMethod = event.detail.value;
    const changeEvent = new CustomEvent("paymentMethodChange", {
      detail: { paymentMethod: selectedMethod }
    });
    this.dispatchEvent(changeEvent);
  }
  //this syntax means we should be able to leave off 'this'
  getIsValid = (val, validatorName) => {
    var isValid, objVal;
    if (validatorName === "cardExpiry") {
      objVal = Payment.fns.cardExpiryVal(val);
      isValid = Payment.fns.validateCardExpiry(objVal.month, objVal.year);
    } else if (validatorName === "cardCVC") {
      isValid = Payment.fns.validateCardCVC(val, this.card.cardType);
    } else if (validatorName === "cardNumber") {
      isValid = Payment.fns.validateCardNumber(val);
    } else if (validatorName === "cardHolderName") {
      isValid = val !== "";
    }
    return isValid;
  };

}


