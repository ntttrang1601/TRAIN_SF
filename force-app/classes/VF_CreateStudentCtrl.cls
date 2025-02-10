public with sharing class VF_CreateStudentCtrl {
    public Student__c student { get; set; }

    public VF_CreateStudentCtrl() {
        student = new Student__c();
    }
    public PageReference createStudent() {
        try {
            student.Name = student.Lastname__c + student.Firstname__c;
            insert this.student;
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.CONFIRM, '学生情報が保存されました'));
            //return null;
            PageReference pageRef = Page.VF_SearchStudent;
            pageRef.setRedirect(true);
            return pageRef;
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, '生徒情報の保存に失敗しました: ' + e.getMessage()));
            return null;
        }
    }
    public PageReference Cancel(){
        PageReference pageRef = Page.VF_SearchStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
}