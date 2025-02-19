// //import { LightningElement } from 'lwc';

// //export default class LWC_ScoreTable extends LightningElement {}
// import { LightningElement, wire, track } from 'lwc';
// import getStudentScores from '@salesforce/apex/LWC_DetailStudentCtrl.getStudentScores';

// export default class LWC_ScoreTable extends LightningElement {
//     @track semesters = [];
//     @track selectedSemester = '';
//     @track semesterOptions = [];
//     totalCredits = 0;
//     overallAverage = 0;

//     @wire(getStudentScores)
//     wiredScores({ error, data }) {
//         if (data) {
//             this.processData(data);
//         } else if (error) {
//             console.error(error);
//         }
//     }

//     processData(data) {
//         let totalCredits = 0;
//         let totalScores = 0;
//         let totalSubjects = 0;

//         this.semesterOptions = [{ label: '全て', value: '' }];

//         this.semesters = data.map(semester => {
//             let semesterTotal = 0;
//             let semesterSubjects = 0;

//             let subjects = semester.SubjectScoreSemester__r ? semester.SubjectScoreSemester__r.map(sub => {
//                 let scores = { Progress: 0, Practical: 0, Midterm: 0, Final: 0 };

//                 if (sub.ScoreSubjectScore__r) {
//                     sub.ScoreSubjectScore__r.forEach(score => {
//                         scores[score.ExamType__c] = score.Score__c;
//                     });
//                 }

//                 let average = sub.AverageScore__c || 0;
//                 let credits = sub.Subject_look__r?.CourseCredit__c || 0;
//                 let subjectCode = sub.Subject_look__r?.SubjectCode__c || 'N/A';

//                 totalCredits += credits;
//                 semesterTotal += average;
//                 semesterSubjects++;

//                 return {
//                     Id: sub.Id,
//                     SubjectCode: subjectCode,
//                     Name: sub.Subject_look__r?.Name || 'N/A',
//                     Credits: credits,
//                     AverageScore: average,
//                     Progress: scores.Progress,
//                     Practical: scores.Practical,
//                     Midterm: scores.Midterm,
//                     Final: scores.Final
//                 };
//             }) : [];

//             totalScores += semesterTotal;
//             totalSubjects += semesterSubjects;

//             this.semesterOptions.push({ label: semester.Name, value: semester.Id });

//             return {
//                 Id: semester.Id,
//                 Name: semester.Name,
//                 StartDate: semester.StartDate__c,
//                 EndDate: semester.EndDate__c,
//                 SubjectScores: subjects,
//                 average: semesterSubjects > 0 ? (semesterTotal / semesterSubjects).toFixed(2) : 'N/A'
//             };
//         });

//         this.totalCredits = totalCredits;
//         this.overallAverage = totalSubjects > 0 ? (totalScores / totalSubjects).toFixed(2) : 'N/A';
//     }

//     get filteredSemesters() {
//         if (!this.selectedSemester) {
//             return this.semesters;
//         }
//         return this.semesters.filter(sem => sem.Id === this.selectedSemester);
//     }

//     handleSemesterChange(event) {
//         this.selectedSemester = event.target.value;
//     }
// }
import { LightningElement, wire, track,api } from 'lwc';
import getStudentScores from '@salesforce/apex/LWC_DetailStudentCtrl.getStudentScores';

export default class LWC_ScoreTable extends LightningElement {
    @api studentId='a00WU00000TyrglYAB';
    @track semesters = [];
    @track selectedSemester = '';
    @track semesterOptions = [];
    @track displayedSemesters = [];
    @track visibleCount = 2;
    
    @wire(getStudentScores, { studentId: '$studentId' })
    wiredScores({ error, data }) {
        if (data) {
            this.processData(data);
        } else if (error) {
            console.error(error);
        }
    }

    processData(data) {
        this.semesterOptions = [{ label: '全て', value: '' }];
        this.semesters = data.map(semester => {
            this.semesterOptions.push({ label: semester.semesterName, value: semester.semesterId });

            return {
                Id: semester.semesterId,
                Name: semester.semesterName,
                StartDate: semester.startDate,
                EndDate: semester.endDate,
                // SubjectScores: semester.subjectScores,
                SubjectScores: semester.subjectScores.map(score => ({
                    ...score,
                    isFail: score.averageScore < 5 // Đánh dấu nếu điểm dưới 5
                })),
                totalCredits: semester.totalCredits,
                semesterGPA: semester.semesterGPA,
                gpaStatus: semester.semesterGPA < 5 ? 'Not Passed' : 'Passed',
                isFailGPA: semester.semesterGPA < 5
            };
        });
        //this.displayedSemesters = this.semesters.slice(0, this.visibleCount);
        this.updateDisplayedSemesters();
    }

    //get filteredSemesters() {
        //return this.selectedSemester ? this.semesters.filter(sem => sem.Id === this.selectedSemester) : this.semesters;
        //return this.showAllSemesters ? this.semesters : this.semesters.slice(0, 2);
    //}
    

    updateDisplayedSemesters() {
        if (this.selectedSemester) {
            // Nếu chọn học kỳ cụ thể, chỉ hiển thị học kỳ đó
            this.displayedSemesters = this.semesters.filter(sem => sem.Id === this.selectedSemester);
        } else {
            // Nếu chọn "全て", chỉ hiển thị học kỳ đầu tiên
            this.displayedSemesters = this.semesters.slice(0, this.visibleCount);
        }
    }

    handleSemesterChange(event) {
        this.selectedSemester = event.target.value;
    
        if (this.selectedSemester === '') {
            // Nếu chọn "全て", reset về trạng thái ban đầu: chỉ hiển thị 2 học kỳ đầu tiên
            this.visibleCount = 2;
        }
    
        this.updateDisplayedSemesters();
    }

    get hasMoreSemesters() {
        return !this.selectedSemester && this.visibleCount < this.semesters.length;
    }

    showMoreSemesters() {
        if (this.hasMoreSemesters) {
            this.visibleCount+=2;
            this.updateDisplayedSemesters();
        }
    }
}

