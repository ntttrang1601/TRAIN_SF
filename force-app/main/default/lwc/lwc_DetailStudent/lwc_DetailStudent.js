
import { LightningElement, track, api } from 'lwc';
import getStudent from '@salesforce/apex/LWC_DetailStudentCtrl.getStudent';

export default class Lwc_DetailStudent extends LightningElement {
    @api message;
    @api studentId = 'a00WU00000TyrglYAB'; // Gán cứng ID
    @track student = {}; // Khởi tạo đối tượng trống

    sendMessageToParent() {
        const event = new CustomEvent('childmessage', {
            detail: { action: 'closeModal' } // Gửi thông điệp rõ ràng
        });
    
        this.dispatchEvent(event);
    }

    connectedCallback() {
        this.getDataInit();
    }

    getDataInit() {
        if (this.studentId) {
            getStudent({ studentId: this.studentId })
                .then(result => {
                    console.log('Student Data:', JSON.stringify(result)); // Debug dữ liệu
                    this.student = result || {}; 
                })
                .catch(error => {
                    console.error('Error fetching student data:', error);
                });
        }
    }
    // Getter để xử lý dữ liệu Class_look__r.Name an toàn
    get className() {
        return this.student && this.student.Class_look__r ? this.student.Class_look__r.Name : '';
    }
    

    fireCloseModalEvent() {
        const closeModalEvent = new CustomEvent('closemodalevent');
        this.dispatchEvent(closeModalEvent);
        console.log('Sự kiện closeModalEvent đã được gửi.');
    }
}