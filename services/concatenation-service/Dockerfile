FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

WORKDIR /app

COPY *.csproj ./

RUN dotnet restore

COPY . .

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR /app

COPY --from=build /app/out .

RUN groupadd -r app && useradd -r -g app app && chown -R app:app /app

ENV ASPNETCORE_URLS=http://+:8086
EXPOSE 8086

USER app

ENTRYPOINT ["dotnet", "ConcatenationService.dll"]
