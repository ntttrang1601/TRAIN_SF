public with sharing class VF_UpdateStudentCtrl {
    public Student__c student { get; set; }
    public VF_UpdateStudentCtrl() {
        // student = GetStudent('a00WU00000TyrglYAB');
        String studentId = ApexPages.currentPage().getParameters().get('studentId');
        student = GetStudent(studentId);
    }
    public PageReference updateStudent(){
        // changed the student information and save

        try {
            update student;
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.CONFIRM, '生徒の記録が正常に作成されました。'));
            PageReference pageRef = Page.VF_SearchStudent;
            pageRef.setRedirect(true);
            return pageRef;
           
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, '学生レコードの作成中にエラーが発生しました: ' + e.getMessage()));
            return null;
        }

    }
    public PageReference Cancel(){
        PageReference pageRef = Page.VF_SearchStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
    public Student__c getStudent(String IdStudent){
        // get student with student code and store in student variable
        try {
            // Retrieve the student record with the provided student code
            student = [SELECT Id, Name, Firstname__c, Lastname__c, StudentCode__c, Gender__c, Birthday__c,
                              TotalCredit__c, GPAScore__c, LearningStatus__c, Class_look__c
                       FROM Student__c
                       WHERE Id = :IdStudent
                       LIMIT 1];
                       ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.CONFIRM, '生徒の記録が正常に取得されました。'));
            return student;
           
        } catch (QueryException e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, '学生記録の取得中にエラーが発生しました: ' + e.getMessage()));
           return student = new Student__c(); // Reset student object if no record is found
            
        }
    }

}