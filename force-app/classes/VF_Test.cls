public with sharing class VF_Test {
    //detail
    public Student__c student {get; set;}

    public VF_Test() {
        String studentId = 'a00WU00000TyrglYAB';
        if (studentId != null) {
            student = [
                SELECT 
                    StudentCode__c
                    , Firstname__c
                    , Lastname__c
                    , Birthday__c
                    , Class_look__c
                    , Gender__c
                    , LearningStatus__c
                FROM Student__c
                WHERE Id = :studentId
                LIMIT 1];
        }
    }
}