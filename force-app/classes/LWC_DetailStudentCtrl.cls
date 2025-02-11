public with sharing class LWC_DetailStudentCtrl {
    @AuraEnabled(cacheable=true) 
    public static Student__c getStudent(Id studentId){
        try {
            if (String.isBlank(studentId)) {
                return new Student__c();
            }
            Student__c student = [
                SELECT Id, Name, StudentCode__c, Firstname__c, Lastname__c, 
                       Class_look__c, Class_look__r.Name, Gender__c, Birthday__c, LearningStatus__c
                FROM Student__c
                WHERE Id = :studentId
                LIMIT 1
            ];
            System.debug('Student Data: ' + student);
            return student;
        } catch (Exception e) {
            throw new AuraHandledException('Get student error: ' + e.getMessage());
        }
    }
    public LWC_DetailStudentCtrl() {

    }
}