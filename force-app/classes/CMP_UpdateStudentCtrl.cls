public with sharing class CMP_UpdateStudentCtrl {
    @AuraEnabled
    public static Student__c getStudent(String studentId) {
        try {
            Student__c student = [SELECT Id, Name, Firstname__c, Lastname__c, StudentCode__c, Gender__c, Birthday__c,
                                         TotalCredit__c, GPAScore__c, LearningStatus__c, Class_look__c
                                  FROM Student__c
                                  WHERE Id = :studentId
                                  LIMIT 1];
            return student;
        } catch (QueryException e) {
            throw new AuraHandledException('An error occurred while retrieving student records: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static List<List<String>> getPicklistValues(String objectName, String fieldName) {
        List<List<String>> picklistValues = new List<List<String>>();
        try {
            // Lấy mô tả trường và các giá trị picklist
            Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe()
                .get(objectName)
                .getDescribe()
                .fields.getMap()
                .get(fieldName)
                .getDescribe();

            // Duyệt qua các giá trị picklist và thêm vào danh sách
            for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
                if (entry.isActive()) {  // Lọc giá trị đang hoạt động
                    List<String> valueLabelPair = new List<String>{entry.getLabel(), entry.getValue()};
                    picklistValues.add(valueLabelPair);  // Thêm vào danh sách, mỗi phần tử là {label, value}
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException('An error has occurred: ' + e.getMessage());
        }
        return picklistValues;
    }

    @AuraEnabled
    public static List<Class__c> getClassLookupRecords() {
        try {
            // Truy vấn dữ liệu từ Class__c
            return [SELECT Id, Name FROM Class__c ORDER BY Name ASC];
        } catch (Exception e) {
            throw new AuraHandledException('An error has occurred: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void updateStudent(Student__c updatedStudent) {
        try {
            System.debug('Student data before save: ' + updatedStudent);

            if (String.isNotBlank(updatedStudent.Lastname__c) && String.isNotBlank(updatedStudent.Firstname__c)) {
                updatedStudent.Name = updatedStudent.Lastname__c + ' ' + updatedStudent.Firstname__c;
            } else {
                throw new AuraHandledException('Lastname and Firstname must not be empty.');
            }

            update updatedStudent;

            System.debug('Student data after save: ' + updatedStudent);
        } catch (DmlException e) {
            throw new AuraHandledException('An error occurred while updating the student record: ' + e.getMessage());
        } catch (Exception e) {
            throw new AuraHandledException('An unexpected error occurred: ' + e.getMessage());
        }
    }

        
    // public CMP_UpdateStudentCtrl() {

    // }
}