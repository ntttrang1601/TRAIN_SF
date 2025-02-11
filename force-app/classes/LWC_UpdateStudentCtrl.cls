public with sharing class LWC_UpdateStudentCtrl {
    @AuraEnabled(cacheable=true)
    public static Student__c getStudent(String studentId) {
        try {
            return [SELECT Id, Name, Firstname__c, Lastname__c, StudentCode__c, Gender__c, Birthday__c,
                           TotalCredit__c, GPAScore__c, LearningStatus__c, Class_look__c
                    FROM Student__c
                    WHERE Id = :studentId
                    LIMIT 1];
        } catch (QueryException e) {
            throw new AuraHandledException('An error occurred while retrieving student records: ' + e.getMessage());
        }
    }

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
            throw new AuraHandledException('An error has occurred: ' + e.getMessage());
        }
        return picklistValues;
    }

    @AuraEnabled(cacheable=true)
    public static List<Class__c> getClassLookupRecords() {
        try {
            return [SELECT Id, Name FROM Class__c ORDER BY Name ASC];
        } catch (Exception e) {
            throw new AuraHandledException('An error has occurred: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void updateStudent(Student__c updatedStudent) {
        try {
            if (String.isNotBlank(updatedStudent.Lastname__c) && String.isNotBlank(updatedStudent.Firstname__c)) {
                updatedStudent.Name = updatedStudent.Lastname__c + ' ' + updatedStudent.Firstname__c;
            } else {
                throw new AuraHandledException('Lastname and Firstname must not be empty.');
            }
            update updatedStudent;
        } catch (DmlException e) {
            throw new AuraHandledException('An error occurred while updating the student record: ' + e.getMessage());
        } catch (Exception e) {
            throw new AuraHandledException('An unexpected error occurred: ' + e.getMessage());
        }
    }
    public LWC_UpdateStudentCtrl() {

    }
}