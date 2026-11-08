import {createParser, type ParsedDocument} from 'xmarkdown-renderer';
import {createParser as createBrowserParser} from 'xmarkdown-renderer/browser';
import {XMarkdown} from 'xmarkdown-renderer/react';
import {mountWidgets} from 'xmarkdown-renderer/widgets';
const document:ParsedDocument=createParser({cacheEntries:0}).parse('Hello');
const pending:Promise<ParsedDocument>=createBrowserParser().parse('Hello');
const componentProps:Parameters<typeof XMarkdown>[0]={document};
void componentProps;
mountWidgets();void pending;
