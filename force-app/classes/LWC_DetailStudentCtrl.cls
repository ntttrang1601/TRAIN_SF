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
    
    // @AuraEnabled(cacheable=true)
    // public static List<Semester__c> getStudentScores() {
    //     Id studentId = 'a00WU00000V7tkIYAR';

    //     return [
    //         SELECT Id, Name, StartDate__c, EndDate__c,
    //             (SELECT Id, Subject_look__r.SubjectCode__c, Subject_look__r.Name, Subject_look__r.CourseCredit__c, AverageScore__c,
    //                 (SELECT ExamType__c, Score__c FROM ScoreSubjectScore__r)
    //             FROM SubjectScoreSemester__r
    //             WHERE Student_look__c = :studentId)
    //         FROM Semester__c
    //         ORDER BY StartDate__c ASC
    //     ];
    // }
    public class SemesterWrapper {
        @AuraEnabled public String semesterId;
        @AuraEnabled public String semesterName;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public Decimal totalCredits;
        @AuraEnabled public Decimal semesterGPA;
        @AuraEnabled public List<SubjectScoreWrapper> subjectScores;
    }

    public class SubjectScoreWrapper {
        @AuraEnabled public String subjectId;
        @AuraEnabled public String subjectCode;
        @AuraEnabled public String subjectName;
        @AuraEnabled public Decimal credits;
        @AuraEnabled public Decimal averageScore;
        @AuraEnabled public Decimal progressScore;
        @AuraEnabled public Decimal practicalScore;
        @AuraEnabled public Decimal midtermScore;
        @AuraEnabled public Decimal finalScore;
    }

    @AuraEnabled(cacheable=true)
    public static List<SemesterWrapper> getStudentScores(Id studentId) {
        //d studentId = 'a00WU00000TyrglYAB';
        if (studentId == null) {
            throw new AuraHandledException('Student ID is required.');
        }
        List<Semester__c> semesters = [
            SELECT Id, Name, StartDate__c, EndDate__c,
                (SELECT Id, Subject_look__r.SubjectCode__c, Subject_look__r.Name, Subject_look__r.CourseCredit__c,
                    (SELECT ExamType__c, Score__c FROM ScoreSubjectScore__r)
                FROM SubjectScoreSemester__r
                WHERE Student_look__c = :studentId)
            FROM Semester__c
            ORDER BY StartDate__c ASC
        ];

        List<SemesterWrapper> semesterData = new List<SemesterWrapper>();

        for (Semester__c semester : semesters) {
            SemesterWrapper semesterWrapper = new SemesterWrapper();
            semesterWrapper.semesterId = semester.Id;
            semesterWrapper.semesterName = semester.Name;
            semesterWrapper.startDate = semester.StartDate__c;
            semesterWrapper.endDate = semester.EndDate__c;
            semesterWrapper.totalCredits = 0;
            semesterWrapper.semesterGPA = 0;
            semesterWrapper.subjectScores = new List<SubjectScoreWrapper>();

            Decimal totalCredits = 0;
            Decimal weightedScoreSum = 0;

            if (semester.SubjectScoreSemester__r != null) {
                for (SubjectScore__c sub : semester.SubjectScoreSemester__r) {
                    SubjectScoreWrapper subWrapper = new SubjectScoreWrapper();
                    subWrapper.subjectId = sub.Id;
                    subWrapper.subjectCode = sub.Subject_look__r?.SubjectCode__c;
                    subWrapper.subjectName = sub.Subject_look__r?.Name;
                    subWrapper.credits = sub.Subject_look__r?.CourseCredit__c != null ? sub.Subject_look__r.CourseCredit__c : 0;

                    Decimal progress = null, practical = null, midterm = null, finalExam = null;
                    
                    // Lấy điểm theo loại kỳ thi
                    for (Score__c score : sub.ScoreSubjectScore__r) {
                        if (score.ExamType__c == 'Progress') {
                            subWrapper.progressScore = score.Score__c;
                            progress = score.Score__c;
                        }
                        if (score.ExamType__c == 'Practical') {
                            subWrapper.practicalScore = score.Score__c;
                            practical = score.Score__c;
                        }
                        if (score.ExamType__c == 'Midterm Exam') {
                            subWrapper.midtermScore = score.Score__c;
                            midterm = score.Score__c;
                        }
                        if (score.ExamType__c == 'FinalTerm Exam') {
                            subWrapper.finalScore = score.Score__c;
                            finalExam = score.Score__c;
                        }
                    }

                    // Tính điểm trung bình (averageScore)
                    Decimal totalScore = 0;
                    Integer count = 0;
                    if (progress != null) { totalScore += progress; count++; }
                    if (practical != null) { totalScore += practical; count++; }
                    if (midterm != null) { totalScore += midterm; count++; }
                    if (finalExam != null) { totalScore += finalExam; count++; }

                    subWrapper.averageScore = (count > 0) ? (totalScore / count).setScale(2, System.RoundingMode.HALF_UP) : 0;

                    // Tính tổng tín chỉ và GPA
                    totalCredits += subWrapper.credits;
                    weightedScoreSum += (subWrapper.averageScore * subWrapper.credits);

                    semesterWrapper.subjectScores.add(subWrapper);
                }
            }

            // Tính GPA
            semesterWrapper.totalCredits = totalCredits;
            semesterWrapper.semesterGPA = (totalCredits > 0) ? (weightedScoreSum / totalCredits).setScale(2, System.RoundingMode.HALF_UP) : 0;

            semesterData.add(semesterWrapper);
        }

        return semesterData;
    }

    
}