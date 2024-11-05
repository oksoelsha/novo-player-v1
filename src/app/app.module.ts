import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ErrorsComponent } from './pages/dashboard/events/errors/errors.component';
import { EventsComponent } from './pages/dashboard/events/events.component';
import { LaunchHistoryComponent } from './pages/dashboard/events/launch-history/launch-history.component';
import { InsightsComponent } from './pages/dashboard/insights/insights.component';
import { LaunchCountComponent } from './pages/dashboard/insights/launch-count/launch-count.component';
import { TopTenComponent } from './pages/dashboard/insights/top-ten/top-ten.component';
import { LaunchActivityComponent } from './pages/dashboard/launch-activity/launch-activity.component';
import { TotalsCardComponent } from './pages/dashboard/totals-card/totals-card.component';
import { HelpComponent } from './pages/help/help.component';
import { VersionMatchIndicatorComponent } from './pages/help/version-match-indicator/version-match-indicator.component';
import { FiltersComponent } from './pages/home/filters/filters.component';
import { RangeSelectorComponent } from './pages/home/filters/range-selector/range-selector.component';
import { GameDetailsComponent } from './pages/home/game-details/game-details.component';
import { HomeComponent } from './pages/home/home.component';
import { MusicComponent } from './pages/home/music/music.component';
import { EditRowModePipe } from './pages/home/pipes/edit-row-mode.pipe';
import { GameMediumIconPipe } from './pages/home/pipes/game-medium-icon.pipe';
import { NewsDatePipe } from './pages/home/pipes/news-date.pipe';
import { SortStatusPipe } from './pages/home/pipes/sort-status.pipe';
import { SearchComponent } from './pages/home/search/search.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { WebMSXComponent } from './pages/web-msx/web-msx.component';
import { AdditionalExternalInfoComponent } from './popups/additional-external-info/additional-external-info.component';
import { BluemsxArgumentsEditComponent } from './popups/bluemsx-arguments-edit/bluemsx-arguments-edit.component';
import { ChangeListingComponent } from './popups/change-listing/change-listing.component';
import { HardwareEditComponent } from './popups/hardware-edit/hardware-edit.component';
import { InfoFileFieldEditComponent } from './popups/info-file-field-edit/info-file-field-edit.component';
import { ManageBackupsComponent } from './popups/manage-backups/manage-backups.component';
import { ManageListingsComponent } from './popups/manage-listings/manage-listings.component';
import { MediaEditComponent } from './popups/media-edit/media-edit.component';
import { MoreScreenshotsComponent } from './popups/more-screenshots/more-screenshots.component';
import { PopupComponent } from './popups/popup.component';
import { QuickLaunchComponent } from './popups/quick-launch/quick-launch.component';
import { RelatedGamesComponent } from './popups/related-games/related-games.component';
import { SavedStatesComponent } from './popups/saved-states/saved-states.component';
import { ScanParametersComponent } from './popups/scan-parameters/scan-parameters.component';
import { WebmsxMachineSetComponent } from './popups/webmsx-machine-set/webmsx-machine-set.component';
import { AlertsComponent } from './shared/components/alerts/alerts.component';
import { ConfirmLeaveComponent } from './shared/components/confirm-leave/confirm-leave.component';
import { DropDownWithInputComponent } from './shared/components/drop-down-with-input/drop-down-with-input.component';
import { DropDownComponent } from './shared/components/drop-down/drop-down.component';
import { ElapsedTimeComponent } from './shared/components/elapsed-time/elapsed-time.component';
import { FieldWithSuggestionsComponent } from './shared/components/field-with-suggestions/field-with-suggestions.component';
import { FileSystemChooserComponent } from './shared/components/file-system-chooser/file-system-chooser.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { WebLinkComponent } from './shared/components/web-link/web-link.component';
import { WindowControlsComponent } from './shared/components/window-controls/window-controls.component';
import { DropfileDirective } from './shared/directives/dropfile/dropfile.directive';
import { EventDatePipe } from './pages/dashboard/pipes/event-date.pipe';
import { LongEventDatePipe } from './pages/dashboard/pipes/long-event-date.pipe';
import { OpenmsxManagementComponent } from './popups/openmsx-management/openmsx-management.component';
import { EnableCheatsComponent } from './popups/enable-cheats/enable-cheats.component';
import { MoreDetailsComponent } from './popups/more-details/more-details.component';
import { GameCompanyAndYearPipe } from './shared/pipes/game-company-and-year.pipe';
import { ScreenshotFilenamePipe } from './pages/home/pipes/screenshot-filename.pipe';
import { ScreenNumberComponent } from './popups/openmsx-management/screen-number/screen-number.component';
import { EmulationSpeedComponent } from './popups/openmsx-management/emulation-speed/emulation-speed.component';
import { StateSaveLoadComponent } from './popups/openmsx-management/state-save-load/state-save-load.component';
import { TextTypingComponent } from './popups/openmsx-management/text-typing/text-typing.component';
import { PasswordsComponent } from './popups/openmsx-management/passwords/passwords.component';
import { CheatsComponent } from './popups/openmsx-management/cheats/cheats.component';

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
    EventsComponent,
    LaunchHistoryComponent,
    ErrorsComponent,
    InsightsComponent,
    TopTenComponent,
    LaunchCountComponent,
    HelpComponent,
    InfoFileFieldEditComponent,
    BluemsxArgumentsEditComponent,
    WebmsxMachineSetComponent,
    RelatedGamesComponent,
    MoreScreenshotsComponent,
    SavedStatesComponent,
    EnableCheatsComponent,
    OpenmsxManagementComponent,
    ScreenNumberComponent,
    EmulationSpeedComponent,
    StateSaveLoadComponent,
    TextTypingComponent,
    PasswordsComponent,
    CheatsComponent,
    QuickLaunchComponent,
    ManageBackupsComponent,
    RangeSelectorComponent,
    FiltersComponent,
    AdditionalExternalInfoComponent,
    VersionMatchIndicatorComponent,
    FieldWithSuggestionsComponent,
    MoreDetailsComponent,
    DropfileDirective,
    EditRowModePipe,
    GameMediumIconPipe,
    SortStatusPipe,
    NewsDatePipe,
    EventDatePipe,
    LongEventDatePipe,
    GameCompanyAndYearPipe,
    ScreenshotFilenamePipe
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
