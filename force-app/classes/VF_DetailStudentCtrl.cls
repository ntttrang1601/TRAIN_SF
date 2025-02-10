public with sharing class VF_DetailStudentCtrl {
    public Student__c student {get; set;}
    public VF_DetailStudentCtrl() {
        String studentId = ApexPages.currentPage().getParameters().get('studentId');
        // String studentId = 'a00WU00000TyrglYAB';
        if (studentId != null) {
            student = [
                SELECT 
                    Id
                    ,Name
                    , StudentCode__c
                    , Firstname__c
                    , Lastname__c
                    , Birthday__c
                    , Class_look__c
                    , Gender__c
                    , LearningStatus__c
                FROM Student__c
                WHERE Id = :studentId
                LIMIT 1];
        }else {
            student = new Student__c(); // Tạo object rỗng nếu không có studentId
        }
    }
    public PageReference  closePage() {
        PageReference pageRef = Page.VF_SearchStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
}