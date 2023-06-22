import {Helpers, logger} from "../Utils";
import {
  AttackParamLocation,
  Module,
  RestScansOptions,
  SCAN_TESTS_TO_RUN_BY_DEFAULT,
  ScanConfig,
  Scans,
  TestType
} from "../Scan";
import {RunScan} from "./RunScan";
import {Arguments, Argv, CommandModule} from "yargs";
import {container} from "tsyringe";

export class Scan implements CommandModule {
  public readonly command = 'scan [options]';
  public readonly describe = 'Start a new scan';

  public builder(argv: Argv): Argv {
    return argv
      .option('profile', {
        alias: 'p',
        describe: 'Profile',
        default: 'default',
        requiresArg: true,
        demandOption: true
      })
      .option('name', {
        alias: 'n',
        describe: 'Name of the scan.',
        requiresArg: true,
        demandOption: true
      })
      .option('auth', {
        alias: 'o',
        describe: 'Auth object ID.',
        requiresArg: true
      })
      .option('archive', {
        alias: 'a',
        normalize: true,
        requiresArg: true,
        describe:
          "A collection your app's http/websockets logs into HAR file. " +
          'Usually you can use browser dev tools or our browser web extension'
      })
      .option('crawler', {
        alias: 'c',
        requiresArg: true,
        array: true,
        describe:
          'A list of specific urls that should be included into crawler.'
      })
      .option('test', {
        choices: Helpers.toArray(TestType),
        default: SCAN_TESTS_TO_RUN_BY_DEFAULT,
        array: true,
        describe: 'A list of tests which you want to run during a scan.'
      })
      .option('project', {
        alias: 'p',
        requiresArg: true,
        string: true,
        describe: 'ID of the project'
      })
      .option('module', {
        default: Module.DAST,
        requiresArg: true,
        choices: Helpers.toArray(Module),
        describe:
          'The dast module tests for specific scenarios, mainly OWASP top 10 and other common scenarios. ' +
          'The fuzzer module generates various scenarios to test for unknown vulnerabilities, ' +
          'providing automated AI led fuzzing testing. This module can be coupled with the repeater to find additional vulnerabilities.'
      })
      .option('host-filter', {
        alias: 'F',
        requiresArg: true,
        array: true,
        describe: 'A list of specific hosts that should be included into scan.'
      })
      .option('header', {
        alias: 'H',
        requiresArg: true,
        array: true,
        describe:
          'A list of specific headers that should be included into request.'
      })
      .option('exclude-param', {
        requiresArg: true,
        array: true,
        string: true,
        describe:
          'A list of regex patterns for parameter names you would like to ignore during the tests. Example: "Id$"'
      })
      .option('exclude-entry-point', {
        array: true,
        describe:
          'A list of JSON strings that contain patterns for entry points you would like to ignore during the tests. ' +
          'Pass an empty string to remove default exclusions. ' +
          'To apply patterns for all HTTP methods, you can set an empty array to "methods". ' +
          `Example: '{ "methods": [], "patterns": ["users\\/?$"] }'`,
        coerce: RunScan.excludeEntryPoint
      })
      .option('smart', {
        boolean: true,
        describe:
          'Use automatic smart decisions such as: parameter skipping, detection phases, etc. to minimize scan time.'
      })
      .option('param', {
        array: true,
        default: [
          AttackParamLocation.BODY,
          AttackParamLocation.QUERY,
          AttackParamLocation.FRAGMENT
        ],
        requiresArg: true,
        choices: Helpers.toArray(AttackParamLocation),
        describe: 'Defines which part of the request to attack.'
      })
      .group(['archive', 'crawler'], 'Discovery Options')
      .group(
        ['host-filter', 'header', 'module', 'repeater', 'test', 'smart'],
        'Additional Options'
      )
      .middleware((args: Arguments) =>
        container.register<RestScansOptions>(RestScansOptions, {
          useValue: {
            insecure: args.insecure as boolean,
            baseUrl: args.api as string,
            apiKey: args.token as string,
            proxyUrl: (args.proxyExternal ?? args.proxy) as string
          }
        })
      );
  }

  public async handler(args: Arguments): Promise<void> {
    try {
      const scanManager: Scans = container.resolve(Scans);

      const scanId: string = await scanManager.create({
        name: args.name,
        module: args.module,
        authObjectId: args.auth,
        projectId: args.project,
        tests: args.test,
        hostsFilter: args.hostFilter,
        headers: Helpers.parseHeaders(args.header as string[]),
        crawlerUrls: args.crawler,
        fileId: args.archive,
        repeaters: args.repeater,
        smart: args.smart,
        attackParamLocations: args.param,
        exclusions: {
          requests: args.excludeEntryPoint,
          params: args.excludeParam
        }
      } as ScanConfig);

      // eslint-disable-next-line no-console
      console.log(scanId);

      process.exit(0);
    } catch (e) {
      logger.error(`Error during "scan:run": ${e.error || e.message}`);
      process.exit(1);
    }
  }
}