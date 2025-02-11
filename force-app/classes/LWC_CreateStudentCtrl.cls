public with sharing class LWC_CreateStudentCtrl {

    public class CustomException extends Exception {}
    @AuraEnabled(cacheable=true)
    public static List<List<String>> getPicklistValues(String objectName, String fieldName) {
        List<List<String>> picklistValues = new List<List<String>>();
        try {
            Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe()
                .get(objectName)
                .getDescribe()
                .fields.getMap()
                .get(fieldName)
                .getDescribe();

            for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
                if (entry.isActive()) {  
                    picklistValues.add(new List<String>{entry.getLabel(), entry.getValue()});
                }
            }
        } catch (Exception e) {
            System.debug('Error fetching picklist values: ' + e.getMessage());
        }
        return picklistValues;
    }

    // Lấy danh sách các bản ghi Class__c
    @AuraEnabled(cacheable=true)
    public static List<Class__c> getClassLookupRecords() {
        try {
            return [SELECT Id, Name FROM Class__c ORDER BY Name ASC];
        } catch (Exception e) {
            System.debug('Error fetching class records: ' + e.getMessage());
            return new List<Class__c>();
        }
    }
    @AuraEnabled
    public static void createStudent(Student__c student) {
        try {
            System.debug('Student data received: ' + JSON.serializePretty(student));
            if (String.isEmpty(student.Lastname__c) || String.isEmpty(student.Firstname__c) || student.Birthday__c == null) {
                throw new CustomException('Missing required fields.');
            }
            student.Name = student.Lastname__c + ' ' + student.Firstname__c;
            insert student;
        } catch (Exception e) {
            System.debug('Error while saving student: ' + e.getMessage());
            throw new CustomException('Failed to save student information: ' + e.getMessage());
        }
    }

    public LWC_CreateStudentCtrl() {

    }
}