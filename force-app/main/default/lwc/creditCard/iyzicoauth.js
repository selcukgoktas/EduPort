// var apiKey = globals.apiKey
// var secretKey = globals.secretKey

var approval = {
    locale: null,
    conversationId: null,
    paymentTransactionId: null
};

var subMerchant = {
    locale: null,
    conversationId: null,
    name: null,
    email: null,
    gsmNumber: null,
    address: null,
    iban: null,
    taxOffice: null,
    contactName: null,
    contactSurname: null,
    legalCompanyTitle: null,
    swiftCode: null,
    currency: null,
    subMerchantKey: null,
    subMerchantExternalId: null,
    identityNumber: null,
    taxNumber: null,
    subMerchantType: null,
    
};

var binNumber = {
    locale:null,
    conversationId:null,
    binNumber:null,
};

var cancel = {
    locale: null,
    conversationId: null,
    paymentId: null,
    ip: null
};

var refund = {
    locale: null,
    conversationId: null,
    paymentTransactionId: null,
    price: null,
    ip: null,
    currency: null
};

var installment = {
    locale:null,
    conversationId:null,
    binNumber:null,
};

var paymentResult = {
    locale:null,
    conversationId:null,
    paymentId: null,
    paymentConversationId:null
};

var createThreeds = {
    locale:null,
    conversationId:null,
    paymentId: null,
    ConversationData:null
};

var paymentCard = {
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

var cardInformation = {
    cardAlias: null,
    cardNumber: null,
    expireYear: null,
    expireMonth: null,
};

var buyer = {
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

var shippingAddress = {
    address: null,
    zipCode: null,
    contactName: null,
    city: null,
    country: null
};

var billingAddress = {
    address: null,
    zipCode: null,
    contactName: null,
    city: null,
    country: null
};

var basketItem = {
    id: null,
    price: null,
    name: null,
    category1: null,
    category2: null,
    itemType: null,
    subMerchantKey:null,
    subMerchantPrice: null
};

function BasketItem() {
    this.id= null;
    this.price= null;
    this.name=null;
    this.category1= null;
    this.category2= null;
    this.itemType=null,
    this.subMerchantKey=null;
    this.subMerchantPrice= null;
}

var basketItems = [];
var enabledInstallments = [];

var payment = {
    locale: null,
    conversationId: null,
    price: null,
    paidPrice: null,
    installment: null,
    paymentChannel: null,
    basketId: null,
    paymentGroup: null,
    paymentCard: paymentCard,
    buyer: buyer,
    shippingAddress: shippingAddress,
    billingAddress: billingAddress,
    basketItems: basketItems,
    currency: null,
    
};

var initializeBkm = {
    locale: null,
    conversationId: null,
    price: null,
    basketId: null,
    paymentGroup: null,
    buyer: buyer,
    shippingAddress: shippingAddress,
    billingAddress: billingAddress,
    basketItems: basketItems,
    callbackUrl:null,
    paymentSource:null,
    enabledInstallments:enabledInstallments
    
};

var initializeCheckout = {
    locale: null,
    conversationId: null,
    price: null,
    installment: null,
    paymentChannel: null,
    basketId: null,
    paymentGroup: null,
    paymentCard: paymentCard,
    buyer: buyer,
    shippingAddress: shippingAddress,
    billingAddress: billingAddress,
    basketItems: basketItems,
    callbackUrl:null,
    paymentSource:null,
    currency: null,
    paidPrice: null,
    forceThreeDS:null,
    cardUserKey: null,
    enabledInstallments:enabledInstallments
};

var checkoutForm = {
    locale: null,
    conversationId: null,
    token: null,
};

var bkm = {
    locale: null,
    conversationId: null,
    token: null,
};

var card = {
    locale:null,
    conversationId:null,
    externalId: null,
    email: null,
    cardUserKey: null,
    card: cardInformation
};

function nullClear(obj){
    for (var member in obj) {
        
        if(obj[member] === null) {    
            delete obj[member];
        }
        else if (typeof obj[member] === 'object'){
            obj[member]=nullClear(obj[member]);
            if(Object.keys(obj[member]).length===0){
                delete obj[member];
            }
        }
    }
    
    return obj;
}

//Set json string to model
function jsonToObj(jsonString, obj) {
    var parsedJsonString = JSON.parse(jsonString)
    for(var key in parsedJsonString) {
        if(parsedJsonString.hasOwnProperty(key)) {
            if (typeof parsedJsonString[key] === 'object') {
                if(Array.isArray(parsedJsonString[key])){
                    for(var i = 0; i < parsedJsonString[key].length; i++){
                        if(key =="basketItems"){
                            obj[key].push(new BasketItem());
                            obj[key][i]=jsonToObj(JSON.stringify(parsedJsonString[key][i]), obj[key][i])
                        }else {
                            obj[key][i] = parsedJsonString[key][i];
                        }
                    }
                }else{
               obj[key] = jsonToObj(JSON.stringify(parsedJsonString[key]), obj[key])
                }
            }else{
                obj[key] = parsedJsonString[key];
            }
            
        }
    }
    obj = nullClear(obj);
    
    return obj;
}

//generate pki string of object
function generateRequestString(obj) {
    var isArray = Array.isArray(obj);
    
    var requestString = '[';
    for (var i in obj) {
        var val = obj[i];
        if (!isArray) {
            requestString += i + '=';
        }
        if (typeof val === 'object') {
            requestString += generateRequestString(val);
        } else {
            requestString += val;
        }
        requestString += isArray ? ', ' : ',';
    }
    requestString = requestString.slice(0, (isArray ? -2 : -1));
    requestString += ']';
    return requestString;
    
}    

//generate authorization string
function generateAuthorizationString(obj,apiKey,secretKey) {
    var requestString = generateRequestString(obj);
    var hashSha1 =  CryptoJS.SHA1(apiKey+'123456789'+secretKey+requestString);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hashSha1);
    var authorization = "IYZWS"+" "+apiKey+":"+hashInBase64;
    // console.log(requestString);
    // postman.setGlobalVariable("pkiString", apiKey+request.headers["x-iyzi-rnd"]+secretKey+requestString);
    return authorization
}

/*
var requestModel = payment;
requestModel = jsonToObj(request.data, requestModel);
var authorization = generateAuthorizationString(requestModel)
postman.setGlobalVariable("authorization", authorization);
*/


export { generateAuthorizationString };
