import { LightningElement, track, api,  wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/LWC_CreateStudentCtrl.getPicklistValues';
import getClassLookupRecords from '@salesforce/apex/LWC_CreateStudentCtrl.getClassLookupRecords';
import createStudent from '@salesforce/apex/LWC_CreateStudentCtrl.createStudent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Lwc_CreateStudent extends LightningElement {
    @api message;
    @track birthdayError = false;
    @track student = {
        Lastname__c: '',
        Firstname__c: '',
        Birthday__c: null,
        Gender__c: null,
        Class_look__c: null,
        LearningStatus__c: null
    };
    
    @track genderOptions = [];
    @track classOptions = [];
    @track learningStatusOptions = [];


    sendMessageToParent() {
        const event = new CustomEvent('childmessage', {
            detail: { action: 'closeModal' } // Gửi thông điệp rõ ràng
        });
    
        this.dispatchEvent(event);
    }

    // Fetch picklist values on component load
    connectedCallback() {
        this.fetchPicklistValues('Student__c', 'Gender__c', 'genderOptions');
        this.fetchClassLookupRecords();
        this.fetchPicklistValues('Student__c', 'LearningStatus__c', 'learningStatusOptions');
    }

    fetchPicklistValues(objectName, fieldName, attributeName) {
        getPicklistValues({ objectName, fieldName })
            .then((result) => {
                this[attributeName] = result.map(item => ({
                    label: item[0],
                    value: item[1]
                }));
            })
            .catch(error => {
                console.error('Error fetching picklist values: ', error);
            });
    }

    fetchClassLookupRecords() {
        getClassLookupRecords()
            .then((result) => {
                this.classOptions = result.map(cls => ({
                    label: cls.Name,
                    value: cls.Id
                }));
            })
            .catch(error => {
                console.error('Error fetching class records: ', error);
            });
    }
    handleInputChange(event) {
        console.log('Field:', event.target.name, 'Value:', event.target.value);
        this.student = { ...this.student, [event.target.name]: event.target.value };
    }
    
    

    // validateFields() {
    //     let isValid = true;
    //     const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
    
    //     inputs.forEach(input => {
    //         if (!input.checkValidity()) { // Dùng checkValidity() thay vì value
    //             isValid = false;
    //             input.reportValidity();
    //         }
    //     });
    
    //     if (!this.student.Lastname__c || !this.student.Firstname__c || !this.student.Birthday__c) {
    //         this.showToast('Error', 'すべてのフィールドを入力してください。', 'error');
    //         isValid = false;
    //     }
    
    //     if (this.student.Birthday__c) {
    //         const birthDate = new Date(this.student.Birthday__c);
    //         if (isNaN(birthDate)) { // Kiểm tra nếu ngày không hợp lệ
    //             this.showToast('Error', '生年月日が無効です。', 'error');
    //             return false;
    //         }
    
    //         const today = new Date();
    //         let age = today.getFullYear() - birthDate.getFullYear();
    //         if (today.getMonth() < birthDate.getMonth() || 
    //             (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    //             age--;
    //         }
    
    //         if (age < 18) {
    //             this.showToast('Error', '学生は18歳以上でなければなりません。', 'error');
    //             isValid = false;
    //         }
    //     }
    //     return isValid;
    // }

    validateFields() {
        let isValid = true;
        this.birthdayError = false; // Reset lỗi sinh nhật
    
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
    
        inputs.forEach(input => {
            if (!input.checkValidity()) { 
                input.reportValidity();
                isValid = false;
            }
        });
    
        if (!this.student.Birthday__c) {
            return isValid;
        }
    
        // Kiểm tra tuổi
        const birthDate = new Date(this.student.Birthday__c);
        if (isNaN(birthDate)) {
            return false;
        }
    
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || 
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
    
        if (age < 18) {
            this.birthdayError = true; // Gán lỗi để HTML hiển thị thông báo
            isValid = false;
        }
    
        return isValid;
    }

    handleSave() {
        if (!this.validateFields()) {
            return; // Nếu có lỗi thì không lưu
        }
    
        createStudent({ student: this.student })
            .then(() => {
                this.showToast('SUCCESS', 'Student information saved.', 'success');
                this.dispatchEvent(new CustomEvent('refreshmessage', {
                    detail: 'refresh',
                    bubbles: true,
                    composed: true
                }));
            })
            .catch(error => {
                console.error('Error saving student: ', error);
            });
    }
    
    


    // handleSave() {
    //     if (!this.validateFields()) {
    //         return;
    //     }
    //     console.log('Student Data:', JSON.stringify(this.student));
    
    //     createStudent({ student: this.student })
    //         .then(() => {
    //             this.showToast('SUCCESS', 'Student information saved.', 'success');
    
    //             // Phát sự kiện cho cha để đóng modal và làm mới danh sách
    //             this.dispatchEvent(new CustomEvent('refreshmessage', {
    //                 detail: 'refresh',
    //                 bubbles: true,
    //                 composed: true
    //             }));
    //         })
    //         .catch(error => {
    //             console.error('Error saving student: ', error);
    //         });
    // }
    


    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }
}