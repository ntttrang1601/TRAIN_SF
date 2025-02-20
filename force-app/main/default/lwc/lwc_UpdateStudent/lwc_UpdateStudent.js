import { LightningElement, api, track, wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/LWC_UpdateStudentCtrl.getPicklistValues';
import getStudent from '@salesforce/apex/LWC_UpdateStudentCtrl.getStudent';
import getClassLookupRecords from '@salesforce/apex/LWC_UpdateStudentCtrl.getClassLookupRecords';
import updateStudent from '@salesforce/apex/LWC_UpdateStudentCtrl.updateStudent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Lwc_UpdateStudent extends LightningElement {
    @api studentId='a00WU00000TyrglYAB';
    @track student = {};
    @track genderOptions = [];
    @track learningStatusOptions = [];
    @track classOptions = [];

    sendMessageToParent() {
        const event = new CustomEvent('childmessage', {
            detail: { action: 'closeModal' } // Gửi thông điệp rõ ràng
        });
    
        this.dispatchEvent(event);
    }

    @wire(getStudent, { studentId: '$studentId' })
    wiredStudent({ error, data }) {
        if (data) {
            this.student = data;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    connectedCallback() {
        this.fetchPicklistValues('Student__c', 'Gender__c', 'genderOptions');
        this.fetchPicklistValues('Student__c', 'LearningStatus__c', 'learningStatusOptions');
        this.fetchClassLookupRecords();
    }

    fetchPicklistValues(objectName, fieldName, attributeName) {
        getPicklistValues({ objectName, fieldName })
            .then(data => {
                this[attributeName] = data.map(item => ({ label: item[0], value: item[1] }));
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    fetchClassLookupRecords() {
        getClassLookupRecords()
            .then(data => {
                this.classOptions = data.map(record => ({ label: record.Name, value: record.Id }));
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleInputChange(event) {
        let field = event.target.name;
        let value = event.target.value;
        
        // Tạo một bản sao mới của student để đảm bảo sự thay đổi được theo dõi
        let updatedStudent = JSON.parse(JSON.stringify(this.student));
        
        // Cập nhật giá trị field mới
        updatedStudent[field] = value;
        
        // Gán lại vào student
        this.student = updatedStudent;
    
        console.log('Updated Student:', this.student);
    }

    // handleSave() {
    //     const today = new Date();
    //     const birthDate = new Date(this.student.Birthday__c);
        
    //     if (!this.student.Lastname__c || !this.student.Firstname__c || !this.student.Birthday__c || !this.student.Gender__c || !this.student.Class_look__c) {
    //         //this.showToast('ERROR', 'All required fields must be filled.', 'error');
    //         return;
    //     }

    //     let age = today.getFullYear() - birthDate.getFullYear();
    //     let monthDiff = today.getMonth() - birthDate.getMonth();
    //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    //         age--;
    //     }

    //     if (age < 18) {
    //         this.showToast('ERROR', 'The student must be at least 18 years old.', 'error');
    //         return;
    //     }

    //     updateStudent({ updatedStudent: this.student })
    //         .then(() => {
    //             this.showToast('Success', 'Student updated successfully', 'success');
    //             // Phát sự kiện cho cha để đóng modal và làm mới danh sách
    //             this.dispatchEvent(new CustomEvent('refreshmessage', {
    //                 detail: 'refresh',
    //                 bubbles: true,
    //                 composed: true
    //             }));
    //         })
    //         .catch(error => {
    //             this.showToast('Error', error.body.message, 'error');
    //         });
    // }
    handleSave() {
        const today = new Date();
        const birthDate = new Date(this.student.Birthday__c);
        let isValid = true; // Biến để kiểm tra tổng thể form có hợp lệ không
    
        // Lặp qua tất cả các input trong form
        this.template.querySelectorAll('.validate-field').forEach(input => {
            const fieldName = input.name;
            const value = input.value;
    
            if (!value) {
                //input.setCustomValidity('この項目を入力してください'); // "Vui lòng nhập trường này"
                isValid = false;
            } else {
                input.setCustomValidity('');
            }
    
            // Kiểm tra tuổi hợp lệ
            if (fieldName === 'Birthday__c' && value) {
                let age = today.getFullYear() - birthDate.getFullYear();
                let monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
    
                if (age < 18) {
                    input.setCustomValidity('学生は18歳以上でなければなりません。'); // "Học sinh phải từ 18 tuổi trở lên."
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                }
            }
    
            input.reportValidity(); // Hiển thị lỗi trên UI
        });
    
        if (!isValid) {
            return; // Dừng xử lý nếu có lỗi
        }
    
        updateStudent({ updatedStudent: this.student })
            .then(() => {
                this.showToast('Success', 'Student updated successfully', 'success');
                // Phát sự kiện cho cha để đóng modal và làm mới danh sách
                this.dispatchEvent(new CustomEvent('refreshmessage', {
                    detail: 'refresh',
                    bubbles: true,
                    composed: true
                    }));
                })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }
    


    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}