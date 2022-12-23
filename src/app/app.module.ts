import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { WindowControlsComponent } from './shared/components/window-controls/window-controls.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileSystemChooserComponent } from './shared/components/file-system-chooser/file-system-chooser.component';
import { DropDownComponent } from './shared/components/drop-down/drop-down.component';
import { EditRowModePipe } from './pages/home/pipes/edit-row-mode.pipe';
import { GameMediumIconPipe } from './pages/home/pipes/game-medium-icon.pipe';
import { AlertsComponent } from './shared/components/alerts/alerts.component';
import { WebMSXComponent } from './pages/web-msx/web-msx.component';
import { GameDetailsComponent } from './pages/home/game-details/game-details.component';
import { MusicComponent } from './pages/home/music/music.component';
import { SearchComponent } from './pages/home/search/search.component';
import { WebLinkComponent } from './shared/components/web-link/web-link.component';
import { PopupComponent } from './popups/popup.component';
import { ScanParametersComponent } from './popups/scan-parameters/scan-parameters.component';
import { MediaEditComponent } from './popups/media-edit/media-edit.component';
import { ChangeListingComponent } from './popups/change-listing/change-listing.component';
import { HardwareEditComponent } from './popups/hardware-edit/hardware-edit.component';
import { ManageListingsComponent } from './popups/manage-listings/manage-listings.component';
import { DropDownWithInputComponent } from './shared/components/drop-down-with-input/drop-down-with-input.component';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { HelpComponent } from './pages/help/help.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InsightsComponent } from './pages/dashboard/insights/insights.component';
import { TotalsCardComponent } from './pages/dashboard/totals-card/totals-card.component';
import { LaunchActivityComponent } from './pages/dashboard/launch-activity/launch-activity.component';
import { LaunchEventsComponent } from './pages/dashboard/launch-events/launch-events.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { ElapsedTimeComponent } from './shared/components/elapsed-time/elapsed-time.component';
import { ConfirmLeaveComponent } from './shared/components/confirm-leave/confirm-leave.component';
import { InfoFileFieldEditComponent } from './popups/info-file-field-edit/info-file-field-edit.component';
import { DropfileDirective } from './shared/directives/dropfile/dropfile.directive';
import { BluemsxArgumentsEditComponent } from './popups/bluemsx-arguments-edit/bluemsx-arguments-edit.component';
import { RelatedGamesComponent } from './popups/related-games/related-games.component';
import { SortStatusPipe } from './pages/home/pipes/sort-status.pipe';
import { WebmsxMachineSetComponent } from './popups/webmsx-machine-set/webmsx-machine-set.component';
import { FiltersComponent } from './pages/home/filters/filters.component';
import { RangeSelectorComponent } from './pages/home/filters/range-selector/range-selector.component';
import { AdditionalExternalInfoComponent } from './popups/additional-external-info/additional-external-info.component';
import { VersionMatchIndicatorComponent } from './pages/help/version-match-indicator/version-match-indicator.component';

const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    WindowControlsComponent,
    HomeComponent,
    GameDetailsComponent,
    SearchComponent,
    MusicComponent,
    SettingsComponent,
    FileSystemChooserComponent,
    DropDownComponent,
    DropDownWithInputComponent,
    AlertsComponent,
    PaginationComponent,
    ElapsedTimeComponent,
    WebMSXComponent,
    WebLinkComponent,
    PopupComponent,
    ConfirmLeaveComponent,
    ScanParametersComponent,
    ChangeListingComponent,
    HardwareEditComponent,
    MediaEditComponent,
    ManageListingsComponent,
    DashboardComponent,
    TotalsCardComponent,
    LaunchActivityComponent,
    LaunchEventsComponent,
    InsightsComponent,
    HelpComponent,
    InfoFileFieldEditComponent,
    BluemsxArgumentsEditComponent,
    WebmsxMachineSetComponent,
    RelatedGamesComponent,
    RangeSelectorComponent,
    FiltersComponent,
    AdditionalExternalInfoComponent,
    VersionMatchIndicatorComponent,
    DropfileDirective,
    EditRowModePipe,
    GameMediumIconPipe,
    SortStatusPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule,
    NgToggleModule,
    NgApexchartsModule,
    ContextMenuModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmLeaveComponent,
  ]
})
export class AppModule {}
