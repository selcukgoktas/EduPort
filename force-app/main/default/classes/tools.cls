/**
 * @description       : 
 * @author            : Selçuk GÖKTAŞ
 * @group             : 
 * @last modified on  : 02-09-2023
 * @last modified by  : Selçuk GÖKTAŞ
**/
public without sharing class tools {
    


    @AuraEnabled
    public static Object simpleGetRequest(String endPoint){
        
        httpResponse res = New httpResponse();
        try {
           

            http http = New http();
            httpRequest req = New httpRequest();
            req.setmethod('GET');
            req.setEndpoint(endPoint);
            res= http.send(req);


        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return res;
    }

    @AuraEnabled
    public static String crypto64(String requestString,String apiKey,String secretKey){

    // String requestString = generateRequestString(obj);
    Blob hashSha1 =  Crypto.generateDigest('SHA1',Blob.valueOf(apiKey+'123456789'+secretKey+requestString));
    String hashInBase64 = EncodingUtil.Base64Encode(hashSha1);

   
    String authorization = 'IYZWS '+apiKey+':'+hashInBase64;

     return authorization;
    }


    
}