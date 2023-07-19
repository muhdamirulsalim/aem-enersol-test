import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public loginForm!: FormGroup;

  constructor(private formbuilder: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.formbuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    const username = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    const loginData = {
      username: username,
      password: password
    };

    this.http.post('http://test-demo.aemenersol.com/api/account/login', loginData)
      .subscribe(
        (response: any) => {
          console.log(response);
          // Authentication successful, handle the response here
          const token = response; // Assuming the response contains the token
          localStorage.setItem('token', token); // Store the token in localStorage
          this.loginForm.reset();
          this.router.navigate(['/dashboard']); // Navigate to dashboard component
        },
        (error: any) => {
          // Authentication failed, handle the error here
          console.error(error);
        }
      );
  }
}
