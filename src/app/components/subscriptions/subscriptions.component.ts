import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, SubscriptionPlan } from '../../services/api.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Administration &rsaquo; Subscription Plans</div>
        <h1 class="page-title">Subscription Plans</h1>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
        @for (plan of plans; track plan.id) {
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-top: 4px solid var(--primary);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <span class="badge badge-success">{{ plan.code }}</span>
                <span class="badge" [class]="plan.isActive ? 'badge-info' : 'badge-danger'">
                  {{ plan.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </div>
              <h2 style="font-size:1.4rem; font-weight:700; color:var(--text-light); margin-bottom:0.5rem;">{{ plan.name }}</h2>
              <div style="font-size:2.2rem; font-weight:800; color:var(--primary); margin-bottom:1rem;">
                \${{ plan.price.toFixed(2) }}
                <span style="font-size:0.9rem; color:var(--text-muted); font-weight:400;">/ {{ plan.durationMonths }} months</span>
              </div>
              <p style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">
                {{ plan.entitlementRules || 'Standard offline content download and license entitlement.' }}
              </p>
            </div>
            <div style="margin-top:1.5rem; pt:1rem; border-top: 1px solid var(--border-color); font-size:0.8rem; color:var(--text-dark);">
              Includes version updates &amp; Cloudflare R2 package access for {{ plan.durationMonths }} months.
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubscriptionsComponent implements OnInit {
  plans: SubscriptionPlan[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSubscriptionPlans().subscribe(p => this.plans = p);
  }
}
