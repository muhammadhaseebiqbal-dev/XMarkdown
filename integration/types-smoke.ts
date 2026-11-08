import {createParser, type ParsedDocument} from 'xmarkdown';
import {createParser as createBrowserParser} from 'xmarkdown/browser';
import {XMarkdown} from 'xmarkdown/react';
import {mountWidgets} from 'xmarkdown/widgets';
const document:ParsedDocument=createParser({cacheEntries:0}).parse('Hello');
const pending:Promise<ParsedDocument>=createBrowserParser().parse('Hello');
const componentProps:Parameters<typeof XMarkdown>[0]={document};
void componentProps;
mountWidgets();void pending;
