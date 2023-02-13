/**
* @description       : 
* @author            : Selçuk GÖKTAŞ
* @group             : 
* @last modified on  : 02-10-2023
* @last modified by  : Selçuk GÖKTAŞ
**/
public without sharing class  guestUserHandler {
    


    @AuraEnabled
    public static string createInvoice(Invoice__c inv,String cardUserKey, String cardToken){

        Guest_User__c guestUser = [SELECT Id,isSubscribed__c FROM Guest_User__c WHERE Id=:inv.Guest_User__c LIMIT 1];
 
        // last transaction on credit card.
        // errorGroup__c
        // errorMessage__c

        /*

        SELECT Id,cardUserKey__c, cardToken__c, lastFourDigits__c, cardType__c, cardBankName__c, Guest_User__c, Name 
        FROM CreditCard__c WHERE cardToken__c='LOKNWSXb78wszu4i+zL4g2aP01M=' AND cardUserKey__c='gz1F3DrcUzgIvbmd7ieahFXyMX4='


        */

        System.debug('Card User Key : '+ cardUserKey);
        System.debug('cardToken  : '+ cardToken);
        

        CreditCard__c cc = [SELECT Id,cardUserKey__c, cardToken__c, errorGroup__c,errorMessage__c 
                                FROM CreditCard__c 
                                WHERE cardUserKey__c=:cardUserKey AND cardToken__c=:cardToken LIMIT 1];

        System.debug(cc);                        

        cc.errorGroup__c = inv.errorGroup__c;
        cc.errorMessage__c = inv.errorMessage__c;



        guestUser.isSubscribed__c=true;
        try {
            insert inv;
            update guestUser;
            update cc;  // always update the cc err fields with the latest invoice news.
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return inv.id;
    }



    @AuraEnabled
    public static string addCard(CreditCard__c cc){

        List<CreditCard__c> cclist=[SELECT Id, Name, cardUserKey__c, cardToken__c, lastFourDigits__c, cardType__c, cardBankName__c,
                                    Primary__c, Expire__c, Holder_Name__c,  Guest_User__c 
                                    FROM CreditCard__c 
                                    WHERE Guest_User__c=:cc.Guest_User__c];



      
        cc.Primary__c=cclist.size()==0?true:false;  

        
        try {

            insert cc;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return cc.id;
    }


   


    
    @AuraEnabled(cacheable=true)
    public static list<Invoice__c> retrieveInvoices(String recordid){
        
        List<Invoice__c> multiInvoice = New List<Invoice__c>();
        
        try{
            
            multiInvoice = [SELECT id, CID__c,PI__c, IID__c,
                            Invoice_Number__c,
                            Start__c, End__c,
                            Currency__c,Amount__c,
                            isPaid__c,Status__c, 
                            Description__c,
                            PDF_URL__c,HOST_URL__c FROM Invoice__c WHERE Guest_User__c=:recordid];
            
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
        
        
        return multiInvoice;
        
    }
    
    
    public static String invoicepaid(Invoice__c inv){
        
        String returnStr;
        
        
        // child obj Invoice__c inv
        
        
        try{
            
            // parent obj
            Guest_User__c guser=New Guest_User__c(CID__c=inv.CID__c);
            
            inv.Guest_User__r = guser;  // child.toParentRelationship = parentRecordWithExtID
            
            insert inv;
            
            returnStr=inv.id+' Invoice record created - '+inv.CID__c+' numbered Customer Invoice Paid Invoice Number :  '+ inv.Invoice_Number__c;
            
            
        }catch(Exception e){
            returnStr=e.getMessage();
            System.debug(returnStr);
        }
        
        
        return returnStr;
    }
    
    
    @AuraEnabled
    public static string getsubscriptionId(Id recId){
        
        Guest_Payment_Method__c junction=[SELECT Guest_User__c, Payment_Method__r.SID__c,Priority__c 
                                          FROM Guest_Payment_Method__c
                                          WHERE Guest_User__c=:recId AND Priority__c='Primary' 
                                          LIMIT 1];
        
        String subscriptionId=junction.Payment_Method__r.SID__c;  
        
        System.debug('Requested Subscription ID: '+subscriptionId);
        
        
        System.debug(subscriptionId);
        return subscriptionId;
    }
    
    
    @AuraEnabled
    public static void updatePaymentDetails(Guest_User__c GU, Guest_Payment_Method__c GPM, Payment_Method__c PM){
 
        try {
            // Insert Payment_Method__c PM
            insert PM;
            
            // Update Guest_User__c GU
            update GU;
            
            
            
            // Update OLD CREDIT CARD Priority  Guest_Payment_Method__c to SECONDARY
            List<Guest_Payment_Method__c> multiGPM = [SELECT id,Guest_User__c FROM Guest_Payment_Method__c WHERE Guest_User__c=:GU.id AND Priority__c='Primary'];
            
            for(Guest_Payment_Method__c singleGPM:multiGPM){
                singleGPM.Priority__c='Secondary';
            }
            update multiGPM;
            
            
            // Insert Guest_Payment_Method__c GPM
            
            GPM.Guest_User__c=GU.id;  // Already inside this information...
            GPM.Payment_Method__c=PM.id;
            insert GPM;
            
            
            
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    
    
    public static String unsubscribe(String cid){
        
        Guest_User__c singleGuest = New Guest_User__c();
        String returnstr;
        
        try {
            singleGuest = [SELECT id, CID__c,isSubscribed__c FROM Guest_User__c WHERE CID__c=:cid LIMIT 1];
            singleGuest.isSubscribed__c=false;
            update singleGuest;
            
            returnstr= 'SF ID : '+ singleGuest.id +'unsubscribed Stripe id : '+ singleGuest.CID__c; 
            
            
        } catch (Exception e) {
            returnstr='ERROR Unsubscribe cid : '+ cid; 
            
        }
        
        
        
        
        
        return returnstr;
    }
    
    
    
    
    
    @AuraEnabled
    public static String register(Guest_User__c singleGuestUser){
        
        System.debug(singleGuestUser);
        
        try {
           
            singleGuestUser.isEmailVerified__c=true;
            insert singleGuestUser;
            // registerUserMail(singleGuestUser);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
            
        }
        
        return singleGuestUser.id;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static Guest_User__c login(Guest_User__c singleGuestUser){
        Guest_User__c isRegistered = New Guest_User__c();

       
        String message = '';
        
        
        try {
            isRegistered=[SELECT Id,First_Name__c,Last_Name__c,Email__c, Password__c,isEmailVerified__c
                          FROM Guest_User__c 
                          WHERE Email__c=:singleGuestUser.Email__c.toLowerCase() AND Password__c=:singleGuestUser.Password__c
                          LIMIT 1];
            
            
            // Payment_Method__c sid = [SELECT id, SID__c, ];
            
            
            
            /*  due to the single email limitation this is cancelled.  
if(!isRegistered.isEmailVerified__c){

message='Please check your email '+ isRegistered.Email__c+' and verify your email. \n If you don\'t receive an email please contact with us. info@dreamsolutionconsultant.com';
AuraHandledException e1 = new AuraHandledException(message);
e1.setMessage(message);
throw e1;

}
*/
            
        } catch (Exception ex) {
            if(ex.getMessage()=='List has no rows for assignment to SObject'){
                message='Incorrect username or password';
                AuraHandledException e2 = new AuraHandledException(message);
                e2.setMessage(message);
                throw e2;
                
            } else {
                message = ex.getMessage();
                AuraHandledException e3 = new AuraHandledException(message);
                e3.setMessage(message);
                throw e3;
            }
            
            
            
            
        }
        
        return isRegistered;
    }
    
    
    @AuraEnabled
    public static Boolean forgotPassword(Guest_User__c singleGuestUser){
        Guest_User__c isRegistered = New Guest_User__c();
        String Context;
        
        try {
            isRegistered=[SELECT Id,First_Name__c,Last_Name__c,Email__c, Password__c
                          FROM Guest_User__c 
                          WHERE Email__c=:singleGuestUser.Email__c
                          LIMIT 1];
            
            Context='Dear ' + isRegistered.First_Name__c + ' ' +isRegistered.Last_Name__c + ' \n';
            
            Context+=' Your UserName :'+isRegistered.Email__c+ '\n';
            Context+=' Your Password :'+isRegistered.Password__c+ '\n';
            Context+='\n \n \n';
            Context+='\n \n \n';
            Context+='Best Regards \n';
            Context+='Dream Solution Consultant';
            
            
            
            
            // EmailHandler.sendEmail(singleGuestUser.Email__c, '🔑 Dream Solution Consultant Portal User Name - Password Credentials', Context);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
        return true;
    }
    
    
    
    @AuraEnabled
    public static Boolean registerUserMail(Guest_User__c singleGuestUser){
        Guest_User__c isRegistered = New Guest_User__c();
        String Context;
        
        try {
            isRegistered=[SELECT Id,First_Name__c,Last_Name__c,Email__c, Password__c
                          FROM Guest_User__c 
                          WHERE Email__c=:singleGuestUser.Email__c
                          LIMIT 1];
            String verifyURL = 'https://consultingpbo.my.salesforce-sites.com/email/services/apexrest/eduportal/email/verify/'+isRegistered.Id;
            
            Context='Dear ' + isRegistered.First_Name__c + ' ' +isRegistered.Last_Name__c + ' \n';
            
            Context+='\n \n \n';
            Context+='Please Verify your user Credentials by click link below \n';
            
            Context+=verifyURL;             
            Context+='\n \n \n';
            Context+=' Your UserName :'+isRegistered.Email__c+ '\n';
            Context+=' Your Password :'+isRegistered.Password__c+ '\n';
            Context+='\n \n \n';
            Context+='\n \n \n';
            Context+='Best Regards \n';
            Context+='Dream Solution Consultant';
            
            System.debug(singleGuestUser);
            System.debug(isRegistered);
            
            
            
            // EmailHandler.sendEmail(singleGuestUser.Email__c, '🔑 Dream Solution Consultant Portal Verify Yourself', Context);
        } catch (Exception e) {
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        
        return true;
    }
    
    


    @AuraEnabled
    public static List<Course__c> getCourses(){
        List<Course__c> multiCourse = New List<Course__c>();

        try {
            multiCourse=[SELECT Id, Name, Image__c,Icon__c, isPaid__c, Description__c,Number__c FROM Course__c ORDER BY Number__c];
                    } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
        return multiCourse;
    }



    @AuraEnabled
    public static List<Section__c> getCourse(String searchCourseId){

        System.debug('Search this course Details : '+searchCourseId);
        List<Section__c> courseDetails = New List<Section__c>();

        try {
            courseDetails=[SELECT course__r.Name, Id, Name, Course__c, icon__c,Number__c, 
            (SELECT Id, Name, icon__c, Type__c, URL__c, Article__c, Section__c,Number__c 
            FROM Lessons__r ORDER BY Number__c) 
            FROM Section__c 
            WHERE course__c =:searchCourseId 
            ORDER BY Number__c];
                    
        
            system.debug(courseDetails);

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
        return courseDetails;
    }
}