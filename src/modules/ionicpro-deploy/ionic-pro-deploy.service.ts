import { Injectable } from '@angular/core';
import { IonicDeploy, IonicProConfig, IonicDeployInfo } from './ionic-pro-deploy.interfaces';
import { Observable } from 'rxjs/Observable';
import { checkDeploy } from './ionic-pro-deploy.decorators';
import { Platform } from 'ionic-angular';
import { PlatformService } from '../../services/platformService';
import { ConfigService } from '../dataSync/services/configService';
import { UserService } from '../dataSync/services/userService';
import { DataSync } from '../dataSync/pages/dataSync/dataSync';
import { LoginPage } from '../dataSync/pages/login/login';

declare const IonicCordova;

@Injectable()
export class IonicProDeployService {
    private _updatePresent = null;
    get updatePresent() {
        return this._updatePresent;
    }
    downloadAvailable = false;
    extractComplete = false;
    currentInfo: IonicDeployInfo;
    _versions: Set<string> = new Set();
    get versions(): string[] {
        return Array.from(this._versions);
    }
    deploy: IonicDeploy;


    public static config: IonicProConfig = null;

    constructor(
        private platformService: PlatformService,
        private userService: UserService,
        private platform: Platform) {
        /* istanbul ignore next */
        this.platform.ready().then(() => {
            this.deploy = typeof IonicCordova !== 'undefined' && IonicCordova.deploy || null;
            if (IonicProDeployService.config) {
                this.init(IonicProDeployService.config).catch(/* istanbul ignore next */err => console.error(err));
            }
        });
    }

    /**
     * Initialize the deploy plugin
     * @param {IonicProConfig} config App configuration
     */
    @checkDeploy()
    init(config: IonicProConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            this.deploy.init(config, resolve, reject);
        }).then(/* istanbul ignore next */async () => {
            this.currentInfo = await this.info();
        });
    }

    /**
     * Check for updates from specified channel
     * @return {Promise<boolean | string>}
     * Resolves with:
     *   TRUE if updates are available and compatible with the current binary version
     *   FALSE
     *     if updates are available but incompatible with the current binary version
     *     or currently unable to check for updates
     * Rejects with an error message if update information is not available
     */
    @checkDeploy()
    check(): Promise<boolean | string> {
        return new Promise((resolve, reject) => {
            this.deploy.check(resolve, reject);
        })
            .then(/* istanbul ignore next */(res: string) => {
                const success = res === 'true';
                this._updatePresent = !!success;
                return success;
            })
            .catch(/* istanbul ignore next */(rej: string) => {
                this._updatePresent = false;
                console.log(rej);
                return rej;
            });
    }

    /**
     * Download an available and compatible update
     * @return {Observable<number>} Emits the download percentage until complete
     */
    @checkDeploy(true)
    download(): Observable<number> {
        return Observable.create((observer: any) => {
            this.observeProgress(observer, 'download', 'true', 'downloadAvailable', true);
        });
    }

    /**
     * Extract a downloaded archive
     */
    @checkDeploy(true)
    extract(): Observable<number> {
        return Observable.create((observer: any) => {
            if (!this.downloadAvailable) {
                observer.error('No download available');
            } else {
                this.observeProgress(observer, 'extract', 'done', 'extractComplete', true);
            }
        });
    }

    /**
     * Redirect to the latest version of the app on this device
     */
    @checkDeploy()
    redirect() {
        return new Promise((resolve, reject) => {
            if (this.extractComplete) {
                this.deploy.redirect(resolve, reject);
            } else {
                reject();
            }
        });
    }

    /**
     * Retrieve information about the current installed build
     * i.e. Get info on current version for this device
     */
    @checkDeploy()
    info(): Promise<IonicDeployInfo> {
        return new Promise((resolve, reject) => {
            this.deploy.info(resolve, reject);
        }).then(/* istanbul ignore next */(res: IonicDeployInfo) => {
            this.currentInfo = res;
            return res;
        });
    }

    /**
     * List downloaded versions on this device
     */
    @checkDeploy()
    getVersions(): Promise<string[] | string> {
        return new Promise((resolve, reject) => {
            this.deploy.getVersions(resolve, reject);
        }).then(/* istanbul ignore next */(res: string[]) => {
            this._versions = new Set(res);
            return res;
        });
    }

    /**
     * Delete a downloaded version on this device
     * @param {string} version UUID of the deploy version downloaded to device
     */
    @checkDeploy()
    deleteVersion(version: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.deploy.deleteVersion(version, resolve, reject);
        }).then(/* istanbul ignore next */() => {
            this._versions.delete(version);
            return version;
        });
    }

    /**
     * Observe the progress of a method returning multiple values
     * and return values in an observable stream
     * @param {any} observer Observer to stream events with
     * @param {string} deployMethod The IonicDeploy API method to execute
     * @param {string} doneString String to indicate process completed successfully
     * @param {string} successProp Class property to set when process completed successfully
     * @param {any} successValue Value to set class property to when process completed successfully
     */
    private observeProgress(observer: any, deployMethod: string, doneString: string, successProp: string, successValue: any) {
        const done = () => this[successProp] = successValue;
        const success = this.getProgressSuccessCallback(observer, doneString, done);
        const error = (err: string) => observer.error(err);
        this.deploy[deployMethod](success, error);
    }

    /**
     * Create a success callback for a function that will return:
     *   - an integer showing progress over time or
     *   - a string indicating process complete
     * @param observer Observer to return updates to subscribers
     * @param completionString String to indicate process complete
     * @param completeCallback Callback to run when process complete
     */
    private getProgressSuccessCallback(observer: any, completionString: string, completeCallback: Function) {
        return (res: string) => {
            switch (typeof res) {
                case 'string':
                    if (res === completionString) {
                        completeCallback();
                        observer.complete();
                    } else {
                        observer.error(res);
                    }
                    break;
                // Return progress percentage
                case 'number':
                    observer.next(+res);
                    break;
            }
        };
    }

    public eligibleForDeploy() {
        return this.platformService.isMobileDevice() && !ConfigService.isDevelopment() && ConfigService.turnOnDeployment();
    }

    public async getNextPageAfterDeploy() {
        return (await this.userService.isUserLoggedIn()) ? DataSync : LoginPage;
    }
}