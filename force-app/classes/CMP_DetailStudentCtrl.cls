public with sharing class CMP_DetailStudentCtrl {
    @AuraEnabled
    public static Student__c getStudent(Id studentId){
        try {
            if(!String.isNotBlank(studentId)){
                return new Student__c();
            }
            List<Student__c> lstStudent = 
                [SELECT Id,
                        Name,
                        StudentCode__c,
                        Firstname__c,
                        Lastname__c,
                        Class_look__r.Name,
                        Gender__c,
                        Birthday__c,
                        LearningStatus__c
                FROM Student__c
                WHERE Id = :studentId];
            return lstStudent.isEmpty() ? new Student__c() : lstStudent[0];
            
        } catch (Exception e) {
            throw new AuraHandledException('Get student error: ' + e.getMessage());
        }
    }
    public CMP_DetailStudentCtrl() {

    }
}