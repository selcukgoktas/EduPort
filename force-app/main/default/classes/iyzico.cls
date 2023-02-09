/**
 * @description       : 
 * @author            : Selçuk GÖKTAŞ
 * @group             : 
 * @last modified on  : 02-09-2023
 * @last modified by  : Selçuk GÖKTAŞ
**/
public without sharing class iyzico {
    public iyzico() {

    }

    @auraEnabled
    public static Object senddata(String url, String headerAuth,String bodyobj){


        System.debug(bodyobj);


       

        System.debug(headerAuth);

        http http = new Http();

        httpRequest req = New httpRequest();
        
        req.setEndpoint(url);
        req.setmethod('POST');
        req.setheader('Authorization',headerAuth);
        req.setheader('x-iyzi-rnd','123456789');
        req.setheader('Accept', '*/*');
        req.setheader('Content-Type', 'application/json');
        req.setBody(bodyobj);

        system.debug(req);

        httpResponse res= http.send(req);

        System.debug(res);
        System.debug(res.getBody());

        return res.getBody();
        



    }
}