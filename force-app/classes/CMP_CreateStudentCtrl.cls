public with sharing class CMP_CreateStudentCtrl {
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
    public static void createStudent(Student__c student) {
        try {
            System.debug('Learning Status Value: ' + student.LearningStatus__c);
            student.Name = student.Lastname__c + ' ' + student.Firstname__c;
            System.debug('Student data before insert: ' + student);
            insert student;
        } catch (Exception e) {
            System.debug('Error while saving student: ' + e.getMessage());
            throw new AuraHandledException('Failed to save student information: ' + e.getMessage());
        }
    }

    // public CMP_CreateStudentCtrl() {

    // }
}