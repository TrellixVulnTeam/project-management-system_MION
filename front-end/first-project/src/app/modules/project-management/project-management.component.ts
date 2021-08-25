import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'
import { ProjectService } from '../../service/project.service';

import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Project } from '../../data/schema/project';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ProjectDetails } from '../../data/schema/project-details';
import { StatusService } from '../../data/service/status.service';
import { JwtServiceService } from 'src/app/service/jwt-service.service';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/data/schema/user';
import { LoginService } from 'src/app/service/login.service';
import { idRole } from 'src/app/data/schema/id-role';
import { FomatInputService } from 'src/app/data/service/fomat-input.service';
import {Todo} from 'src/app/data/schema/todo';



@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.css'],
})
export class ProjectManagementComponent implements OnInit {
  projectList: ProjectDetails[] = [];
  newProject: Project = new Project(); //
  formProject!: FormGroup;
  username!: String;
  userId!: number;
  user: User = new User();
  role!: String;
  isAdmin: boolean = true;
  project: Project = new Project();
  arrPE: idRole[] = new Array();
  admin: User = new User();
  d1: string;
  d2: string;
  progress: number = 0;
  dateCheck = true;
  
 

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public getStatus: StatusService,
    private jwtService: JwtServiceService,
    private userService: UserService,
    private loginService: LoginService,
    public fomat:FomatInputService,
    public datepipe: DatePipe
  ) { }
  formSearch = this.formBuilder.group({
    name:[''],
    status:[''],
    startDate:[''],
    endDate:['']
  });
  onSearch(){
    let name = this.formSearch.value.name;
    let status = this.formSearch.value.status;
    let startDate = this.datepipe.transform(this.formSearch.value.startDate,'yyyy-MM-dd');
    startDate=startDate==null?'':startDate;
    let endDate = this.datepipe.transform(this.formSearch.value.endDate,'yyyy-MM-dd');
    endDate=endDate==null?'':endDate;
    this.projectService.searchProject(name, status, startDate, endDate).subscribe(data=>{
      console.log('datasearch : ',data);
      
    })
    console.log(name, status, startDate, endDate); 
  }

  ngOnInit(): void {
    if (!this.loginService.logIn) {
      this.projectList = null;
    }

    this.makeForm();

    this.role = this.jwtService.getRole();

    if (this.role === '[ROLE_ADMIN]') {
      this.getDetails();

    } else {
      this.isAdmin = false;
      this.username = this.jwtService.getUsername();

      this.userService.getUser(this.username).subscribe((data) => {
        this.user = data;
        console.log(data);
        this.userId = this.user.id;

        this.projectService.getListProjectOfUser(this.userId).subscribe(
          (data) => {
            this.projectList = data;

            console.log('Project List: ' +this.projectList);
            this.projectList.forEach((data) => {
              let tasks: Array<any> = <Array<any>>data.taskList;
              let partners: Array<any> = <Array<any>>data.projectEmployeeList;
              let todo = 0;
              let todoProgress = 0;




              data.taskNum = tasks.length;
              tasks.forEach((element) => {
                element.todoList;
                if ((element['todoList'].status) == 'done') {
                  todoProgress ++;
                }
                todo += element['todoList'].length;
              });
              data.partnerNum = partners.filter(function (item) {
                return !item.delete;
              }).length;
              console.log(data.partnerNum);
              data.todoNum = todo;
              data.progress = (todoProgress/todo) * 100;

            });
            console.log('Project list: '+ this.projectList);

          },
          (error) => {
            console.log(error.error.message);
          }
        );
      });
    }


  }

  date = new Date();
  getDetails() {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        this.projectList = data['content'];
        this.projectList.forEach((data) => {
          let tasks: Array<any> = <Array<any>>data.taskList;
          let partners: Array<any> = <Array<any>>data.projectEmployeeList;
          let todo = 0;
          let todoProgress = 0;

          data.taskNum = tasks.length;
          tasks.forEach((element) => {

            element['todoList'].forEach((todo)=>{
              if (todo.status === 'done'){
                todoProgress ++;
              }

            })
            todo += element['todoList'].length;
          });
          data.partnerNum = partners.filter(function (item) {
            return !item.delete;
          }).length;
          console.log('partner '+ data.partnerNum);
          data.todoNum = todo;
          if (todo == 0){
            data.progress = 0;
          } else {
            data.progress = Math.round(todoProgress/todo * 100);
          }


          console.log('todoProgress '+todoProgress)
          console.log('todoNum '+data.todoNum);
          console.log(' progress '+data.progress);
        });
        console.log(this.projectList);
      },
      (error) => {
        console.log(error.error.message);
      }
    );
  }

  makeData(){
    this.projectList.forEach((data) => {
      let tasks: Array<any> = <Array<any>>data.taskList;
      let partners: Array<any> = <Array<any>>data.projectEmployeeList;
      let todo = 0;
      data.taskNum = tasks.length;
      tasks.forEach((element) => {
        todo += element['todoList'].length;
      });
      data.partnerNum = partners.filter(function (item) {
        return !item.delete;
      }).length;
      console.log(data.partnerNum);
      data.todoNum = todo;
    });
  }
  makeForm() {
    this.formProject = new FormGroup({
      name: new FormControl('', [Validators.required]),
      des: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null),
      status: new FormControl('draft', [Validators.required]),
    });
  }

  open(content: any) {
    this.makeForm();
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });
  }

  close() { }

  fomatDate(date: any): string {
    if(date===null) return '';
    let rs = '';
    let year = date.year;
    let month: String = new String(date.month);
    if (month.length == 1) month = '0' + month;
    let day: String = new String(date.day);
    if (day.length == 1) day = '0' + day;
    return year + '-' + month + '-' + day;
  }
  saveProject() {
    this.dateCheck = true;
    if (this.formProject.valid) {
      console.log('click save!!!');
      this.newProject.name = this.formProject.value.name;
      this.newProject.des = this.formProject.value.des;
      this.newProject.startDate = this.fomatDate(
        this.formProject.value.startDate
      );
      this.newProject.endDate = this.fomatDate(this.formProject.value.endDate);
      this.newProject.status = this.formProject.value.status;
      // this.newProject.creater = 1;

      console.log(
        this.fomatDate(this.newProject.startDate),
        this.fomatDate(this.formProject.value.endDate)
      );

      this.d1 = this.newProject.startDate.toString();
      this.d2 = this.newProject.endDate.toString();
      if((this.newProject.endDate!=='' && this.fomat.compare(this.d1,this.d2)) || this.newProject.endDate===''){

        this.projectService.postProject(this.newProject).subscribe((data) => {
          this.project = data;
          console.log(data);
          console.log(this.project);
          console.log(this.user);
          this.addAmin();
          this.getDetails();
        });

        this.modalService.dismissAll();
        this.makeForm();

      }else{
        this.dateCheck = false;
      }
    } else {
      alert('DATA INVALID');
    }
  }

  addAmin() {
    this.userService.getUser(this.jwtService.getUsername()).subscribe(
      (data) => {
        this.admin = data;
        console.log(data)
        this.arrPE.push({
          user: this.admin,
          role: 'admin',
          projectId: this.project.id,
        });
        console.log(this.arrPE);
        this.projectService.postRole(this.arrPE).subscribe(
          (data) => {
            console.log(data + 'add success');
          },
          (error) => {
            console.log(error.error.message);
          }
        );
      },
      (error) => {
        console.log(error.error.message);
      }
    );
  }

  get name() {
    return this.formProject.get('name');
  }
  get des() {
    return this.formProject.get('des');
  }
  get startDate() {
    return this.formProject.get('startDate');
  }
  get endDate() {
    return this.formProject.get('endDate');
  }
  get status() {
    return this.formProject.get('status');
  }
}
