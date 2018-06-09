%{
Copyright (c) 2011, MIT.
Developed with the sponsorship of the Defense Advanced Research Projects
Agency (DARPA).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this data, including any software or models in source or binary form, as
well as any drawings, specifications, and documentation (collectively "the
Data"), to deal in the Data without restriction, including without
limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Data, and to permit persons to whom
the Data is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Data.

THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS, SPONSORS, DEVELOPERS, CONTRIBUTORS, OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE DATA OR
THE USE OR OTHER DEALINGS IN THE DATA.
%}

function pareto_set = gen_pareto_set(Z_all, varargin)
% GEN_PARETO_SET Returns row indices of the (fuzzy) pareto optimal subset 
%
% pareto_set = gen_pareto_set(Z_all)
%           or
% pareto_set = gen_pareto_set(Z_all, BiB)
%           or
% pareto_set = gen_pareto_set(Z_all, BiB, sortObj,returnUnique)
%           or
% pareto_set = gen_pareto_set(Z_all, BiB, sortObj,returnUnique,FuzzyK)
%
%   Arguments passed as and empty matrix, [], will retain default values
%
%   Z_all:      Objective values (one row per observation)
%
%   BiB:        Should objective i be bigger is better (BiB(i) = 1) or 
%   smaller is better (BiB(i) = 0).  Default si smaller is better for all
%   objectives.
%
%   sortObj:    The returned pareto set will ordered by this objective. 
%   Default is not sort the pareto set.
%
%   returnUnique:  Set to true if you want a unique subset of pareto set
%   members.  Default is to return all pareto set members.
%
%   FuzzyK:     Front fuzziness factor.  Amount by which an observation can
%   be away from the front and still considered optimal.  Expressed as a
%   fraction of the objective function(s) range.  Default is to allow no
%   fuzziness.
%
% Version: 2009.10.01
% Nirav B. Shah 01/2009

% Debug plotting flag
plotDebug = false;

% Process and check the input arguments
% check the number of arguments
error(nargchk(1,5,nargin,'struct'));

numObj = size(Z_all,2);
numDes = size(Z_all,1);

% Defaults
sortObj = 0; % Pareto set is unsorted
fuzzMargin = zeros(1,numObj); % No fuzz margin
returnUnique = false; % return all set members

if nargin >= 2
    if ~isempty(varargin{1})
        BiB = logical(varargin{1});
        if length(BiB) ~= size(Z_all,2)
            error('GEN_PARETO_SET:BadBiBsize',...
                'The number of element in argument BiB must equal size(Z_all,2)');
        end;
        % make all objective smaller is better
        Z_all(:,BiB) = -Z_all(:,BiB);
    end;
end;

minZ = min(Z_all);
maxZ = max(Z_all);

if nargin >= 3
    if ~isempty(varargin{2})
        sortObj = varargin{2};
        if (sortObj < 1) || (sortObj > numObj)
            error('GEN_PARETO_SET:SortObjOutOfRange',...
                'sortObj must be between 1 and the number of objectives');
        end;
    end;
end;
if nargin >= 4
    if ~isempty(varargin{3})
        returnUnique = logical(varargin{3});
    end;
end;
if nargin >= 5
    if ~isempty(varargin{4})
        fuzzK = varargin{4};
        fuzzMargin = fuzzK * (maxZ - minZ);
        if (fuzzK < 0) || (fuzzK > 1)
            error('GEN_PARETO_SET:fuzzKOutOfRange',...
                'fuzzK must be between 0 and 1');
        end;
    end;
end;


%%%%%%%%%%%%% Find the pareto front %%%%%%%%%%%%%
% compute each points manhattan distance from utopia
[utopDist,utopIdx] = sort(sum(abs((Z_all-repmat(minZ,numDes,1))./repmat(maxZ,numDes,1)),2));

% march through points in order of distance
paretoFlag = -ones(1,numDes);
for candidate = utopIdx'
    if paretoFlag(candidate) == -1
        canObj = Z_all(candidate,:);

        % build up domination vector for the candidate
        if any(canObj - fuzzMargin < minZ)
            dom = false;
        else
            dom = true(numDes,1);
            for theObj = 1:numObj
                dom = dom & Z_all(:,theObj) < canObj(theObj) - fuzzMargin(theObj);
            end;
        end;
        
        % if there were no dominating designs ...
        if (isempty(find(dom,1)))        
            % find all the designs that the candidate dominates and
            % remove them from consideration

            if all(canObj + fuzzMargin < maxZ)
                dom = true(numDes,1);
                for theObj = 1:numObj
                    % note the switch in the direction of inequality vs above
                    dom = dom & Z_all(:,theObj) >= canObj(theObj) + fuzzMargin(theObj);
                end;   
%                 dom = all(Z_all >= repmat((canObj + fuzzMargin),numDes,1),2);                
                % remove the dominated designs from consideration
                paretoFlag(dom) = 0;
            end;
            % mark the candidate as in the pareto set
            paretoFlag(candidate) = 1;
        else
            % remove the candidate from consideration
            paretoFlag(candidate) = 0;
        end;
    end;
    % Plotting routine for debugging
    if plotDebug && numObj > 1 && (candidate == utopIdx(end) || mod(candidate,numDes/100)<1)
        plot(Z_all(:,1),Z_all(:,2),'g.',...
            Z_all(paretoFlag == 1,1),Z_all(paretoFlag == 1,2),'r.',...
            Z_all(paretoFlag == 0,1),Z_all(paretoFlag == 0,2),'b.');
        title(['GEN_PARETO_SET Debug plot -- ' ... 
            'Percent Complete: ' num2str(floor((1-sum(paretoFlag<0)/numDes)*100))],...
            'Interpreter','none');
        xlabel('Z_1');
        ylabel('Z_2');
        drawnow;
    end;
end;

% idenitfy pareto flagged indices
pareto_set = find(paretoFlag == 1);

% Post process set depending upon flags passed
if returnUnique
    % ensure uniqueness
    [B,I] = unique(Z_all(pareto_set,:),'rows');
    if length(I) ~= length(pareto_set)
        warning('GEN_PARETO_SET:RepeatedParetoDesigns',...
            'There are repeated points on the Pareto Front, a unique sub-set will be returned');
    end;
    pareto_set = pareto_set(I);
end;
if sortObj
    [sortObjVals,sortParetoIdx] = sort(Z_all(pareto_set,sortObj));
    pareto_set = pareto_set(sortParetoIdx);
end;
